from django.http import JsonResponse
from django.views import View
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo import DESCENDING
from bson import json_util
from urllib.parse import urlparse, parse_qs, unquote
from . import AI
from django.http import StreamingHttpResponse
CALCULATE_30_DAY_CHANGE = False;

# Define the connection strings
CONN_STRINGS = {
  'flights': {
    'uri': 'mongodb+srv://premiumcpp:469xZNMd1jaTxqzV@flightdata.s38refr.mongodb.net/',
    'db': 'flights'
  },
  'healthcheck': {
    'uri': 'mongodb+srv://premiumcpp:sYQv5RBhqp0xA0iK@healthcare.k9byvtu.mongodb.net/',
    'db': 'Healthcheck'
  },
  'charters': {
    'uri': 'mongodb+srv://premiumcpp:RVtVrnbKFKBPXFA1@cluster0.6qv6nhw.mongodb.net/',
    'db': 'charter_aircraft'
  },
  'flights_new': {
    'uri': 'mongodb://admin:RfEwsdf3334D2cDS434FDS6CBdGd5F@161.35.33.65:58745/flights',
    'db': 'flights'
  },
}

MODELS_TO_IGNORE = [
  "Canadair Regional Jet 200",
  "Embraer 190",
  "Embraer 195"
]

def build_filter_pipeline(request, healthcheckDB):
  # Get filters from request as lists
  class_filter = request.GET.getlist('class')
  make_filter = request.GET.getlist('make')
  model_filter = request.GET.getlist('model')

  print(class_filter)
  # Initialize match conditions
  match_conditions = {}

  if healthcheckDB:
    if class_filter:
      match_conditions['aircraft_details.category'] = {'$in': class_filter}
    if make_filter:
      match_conditions['aircraft_details.make'] = {'$in': make_filter}
    if model_filter:
      match_conditions['aircraft_details.model'] = {'$in': model_filter}
  else:
    if class_filter:
      match_conditions['aircraft_class'] = {'$in': class_filter}
    if make_filter:
      match_conditions['make'] = {'$in': [item.upper() for item in make_filter]}
    if model_filter:
      match_conditions['model'] = {'$in': model_filter}

  # Building the pipeline
  pipeline = []
  if match_conditions:
    if healthcheckDB:
      pipeline.append({
        '$lookup': {
          'from': 'aircrafts',
          'localField': 'registration',
          'foreignField': 'registration',
          'as': 'aircraft_details'
        }
      })
      pipeline.append({'$unwind': '$aircraft_details'})
    pipeline.append({'$match': match_conditions})

  return pipeline

def get_mongo_client(db_key):
  if db_key in CONN_STRINGS:
    print(f"Connecting to '{db_key}' database...")
    client = MongoClient(CONN_STRINGS[db_key]['uri'])
    return client[CONN_STRINGS[db_key]['db']]
  else:
    print("Database configuration for '{db_key}' not found.")
    raise ValueError(f"Database configuration for '{db_key}' not found.")

# Returns a list of live flights
class LiveFlights(View):
  def get(self, request):
    try:
      
      db = get_mongo_client('flights_new')
      collection = db['flights']
      print("SUCCESS ")
      pipeline = build_filter_pipeline(request, False)
      pipeline += [
        {
          '$match': {
            "status": "en-route",
            "dep_city": {"$exists": True, "$ne": "", "$ne": None},
            "arr_city": {"$exists": True, "$ne": "", "$ne": None},
            "lat": {"$exists": True},
            "lng": {"$exists": True},
            "aircraft": {"$exists": True, "$ne": ""}, 
            'model': {'$nin': MODELS_TO_IGNORE}, 
            "dir": {"$exists": True}
          }
        }
      ]

      flights = list(collection.aggregate(pipeline))

      formatted_result = [
        {
          'origin': flight['dep_city'],
          'destination': flight['arr_city'],
          'aircraft': flight['aircraft'],
          'lat': flight['lat'],
          'lng': flight['lng'],
          'dir': flight['dir'],
          'id': str(flight['_id'])
        } for flight in flights if flight['_id']
      ]

      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      print("Error in LiveFlights GET")
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights for the current and previous day, week, and month
class FlightsByPeriod(View):
  def get(self, request):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      # Calculate start times for day, week, and month
      now = datetime.utcnow()
      start_day = now - timedelta(days=1)
      start_prev_day = now - timedelta(days=2)
      start_week = now - timedelta(days=7)
      start_prev_week = now - timedelta(days=14)
      start_month = now - timedelta(days=30)
      start_prev_month = now - timedelta(days=60)

      # Aggregation pipeline to count flights for current and previous periods
      pipeline = [
        {
          '$match': {
            'createdAt': {'$gte': start_prev_month },
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {
          '$group': {
            '_id': None,
            'last_day': {
              '$sum': {
                '$cond': [{'$gte': ['$createdAt', start_day]}, 1, 0]
              }
            },
            'prev_day': {
              '$sum': {
                '$cond': [{'$and': [{'$gte': ['$createdAt', start_prev_day]}, {'$lt': ['$createdAt', start_day]}]}, 1, 0]
              }
            },
            'last_week': {
              '$sum': {
                '$cond': [{'$gte': ['$createdAt', start_week]}, 1, 0]
              }
            },
            'prev_week': {
              '$sum': {
                '$cond': [{'$and': [{'$gte': ['$createdAt', start_prev_week]}, {'$lt': ['$createdAt', start_week]}]}, 1, 0]
              }
            },
            'last_month': {
              '$sum': {
                '$cond': [{'$gte': ['$createdAt', start_month]}, 1, 0]
              }
            },
            'prev_month': {
              '$sum': {
                '$cond': [{'$and': [{'$gte': ['$createdAt', start_prev_month]}, {'$lt': ['$createdAt', start_month]}]}, 1, 0]
              }
            }
          }
        }
      ]

      result = list(collection.aggregate(pipeline))
      if result:
        counts = result[0]
      else:
        counts = {'last_day': 0, 'prev_day': 0, 'last_week': 0, 'prev_week': 0, 'last_month': 0, 'prev_month': 0}

      # Calculate percentage changes
      def calculate_change(current, previous):
        if previous == 0:
          return 0 if current == 0 else 100
        return ((current - previous) / previous) * 100

      changes = {
        'change_day': calculate_change(counts.get('last_day', 0), counts.get('prev_day', 0)),
        'change_week': calculate_change(counts.get('last_week', 0), counts.get('prev_week', 0)),
        'change_month': calculate_change(counts.get('last_month', 0), counts.get('prev_month', 0)),
      }

      return JsonResponse({'counts': counts, 'changes': changes})
    except Exception as e:
        print("Error in FlightsByPeriod GET", e)
        return JsonResponse({'error': str(e)}, status=500)

# Returns number of departures by continent
class FlightsByContinent(View):
  def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))

      pipeline = []
      match_conditions = {}

      reg_filter = request.GET.getlist('reg')
      
      if reg_filter:
        match_conditions['reg_number'] = {'$in': reg_filter}

      if match_conditions:
        pipeline.append({'$match': match_conditions})

      # Aggregation pipeline to count departures by continent within the specified time period
      pipeline += [
        {
          '$match': {
            'createdAt': {'$gte': start_day}, 
            'continent': {'$ne': ''},
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {
          '$group': {
            '_id': '$continent',  # Group by continent
            'count': {'$sum': 1}  # Count occurrences
          }
        },
        {'$sort': {'count': -1}}
      ]

      result = list(collection.aggregate(pipeline))
      formatted_result = {item['_id']: item['count'] for item in result}

      return JsonResponse(formatted_result)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by aircraft category
class FlightsByCategory(View):
   def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))

      # Aggregation pipeline to count departures by continent within the specified time period
      pipeline = [
        {
          '$match': {
            'createdAt': {'$gte': start_day},
            'category': {'$ne': ''},
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {'$group': {'_id': '$aircraft_class', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
      ]

      result = list(collection.aggregate(pipeline))
      formatted_result = {item['_id']: item['count'] for item in result}

      return JsonResponse(formatted_result)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by aircraft manufacturer
class FlightsByMake(View):
  def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))

      # Aggregation pipeline to count departures by continent within the specified time period
      pipeline = [
        {
          '$match': {
            'createdAt': {'$gte': start_day},
            'make': {'$nin': ['', "DART", "HARBIN"]},
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {'$group': {'_id': '$make', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}}
      ]

      result = list(collection.aggregate(pipeline))
      formatted_result = {item['_id']: item['count'] for item in result}

      return JsonResponse(formatted_result)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of domestic and international flights for given time period
class DomesticVsInternationalFlights(View):
  def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))

      # Aggregation pipeline to count departures by continent within the specified time period
      pipeline = [
        {
          '$match': {
            'createdAt': {'$gte': start_day},
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {
          '$project': {
            'isDomestic': {
              '$cond': [
                {'$eq': ['$arr_country', '$dep_country']}, 
                'Domestic', 
                'International'
              ]
            }
          }
        },
        {
          '$group': {
            '_id': '$isDomestic', 
            'count': {'$sum': 1}
          }
        }
      ]

      result = list(collection.aggregate(pipeline))
      formatted_result = {item['_id']: item['count'] for item in result}

      return JsonResponse(formatted_result)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by airport
class FlightsByAirport(View):
  def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))
      start_prev = now - timedelta(days=int(days)*2)

      should_calculate_change = CALCULATE_30_DAY_CHANGE or days not in [30]

      pipeline = build_filter_pipeline(request, False)
      
      reg_filter = request.GET.getlist('reg')

      if reg_filter:
        pipeline.append({'$match': {'reg_number': {'$in': reg_filter}}})

      pipeline += [
        {
          '$match': {
            'createdAt': {'$gte': start_prev},  # Include flights from the start of the previous period
            'arr_lat': {'$ne': None, '$ne': ''},
            'arr_lng': {'$ne': None, '$ne': ''},
            'arr_name': {'$ne': None, '$ne': ''},
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {
          '$group': {
            '_id': '$arr_name',
            'current_period_count': {
              '$sum': {
                '$cond': [
                  {'$gte': ['$createdAt', start_day]},
                  1,
                  0
                ]
              }
            },
            'previous_period_count': {
              '$sum': {
                '$cond': [
                  {'$lt': ['$createdAt', start_day]},
                  1,
                  0
                ]
              }
            },
            'arr_country': {'$first': '$arr_country'},
            'arr_lat': {'$first': '$arr_lat'},
            'arr_lng': {'$first': '$arr_lng'}
          }
        }
      ]

      if should_calculate_change:
        pipeline += [
          {
            '$project': {
              'airport': '$_id',
              'country': '$arr_country',
              'lat': '$arr_lat',
              'lng': '$arr_lng',
              'movements': '$current_period_count',
              'change': {
                '$cond': {
                  'if': {'$eq': ['$previous_period_count', 0]},
                  'then': None,  # Handle division by zero or no previous data
                  'else': {
                    '$multiply': [
                      {
                        '$divide': [
                          {'$subtract': ['$current_period_count', '$previous_period_count']},
                          '$previous_period_count'
                        ]
                      },
                      100
                    ]
                  }
                }
              }
            }
          }
        ]
      else:
        pipeline += [
          {
            '$project': {
              'airport': '$_id',
              'country': '$arr_country',
              'lat': '$arr_lat',
              'lng': '$arr_lng',
              'movements': '$current_period_count',
            }
          }
        ]

      pipeline += [{'$sort': {'movements': -1}}]

      result = list(collection.aggregate(pipeline))
      return JsonResponse(result, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by city
class FlightsByCity(View):
 def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))
      start_prev = now - timedelta(days=int(days)*2)

      should_calculate_change = CALCULATE_30_DAY_CHANGE or days not in [30]

      pipeline = build_filter_pipeline(request, False)
      pipeline = [
        {
          '$match': {
            'createdAt': {'$gte': start_prev},
            'arr_lat': {'$ne': None, '$ne': ''},  # Exclude None or empty string for latitude
            'arr_lng': {'$ne': None, '$ne': ''},  # Exclude None or empty string for longitude
            'arr_city': {'$ne': None, '$ne': ''}, # Exclude None or empty string for city
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {
          '$group': {
            '_id': '$arr_city',
            'current_period_count': {
              '$sum': {
                '$cond': [
                  {'$gte': ['$createdAt', start_day]},
                  1,
                  0
                ]
              }
            },
            'previous_period_count': {
              '$sum': {
                '$cond': [
                  {'$lt': ['$createdAt', start_day]},
                  1,
                  0
                ]
              }
            },
            'arr_city': {'$first': '$arr_city'},
            'arr_lat': {'$first': '$arr_lat'},
            'arr_lng': {'$first': '$arr_lng'}
          }
        }
      ]

      if should_calculate_change:
        pipeline += [
          {
            '$project': {
              'city': '$_id',
              'country': '$arr_country',
              'lat': '$arr_lat',
              'lng': '$arr_lng',
              'movements': '$current_period_count',
              'change': {
                '$cond': {
                  'if': {'$eq': ['$previous_period_count', 0]},
                  'then': None,  # Handle division by zero or no previous data
                  'else': {
                    '$multiply': [
                      {
                        '$divide': [
                          {'$subtract': ['$current_period_count', '$previous_period_count']},
                          '$previous_period_count'
                        ]
                      },
                      100
                    ]
                  }
                }
              }
            }
          }
        ]
      else:
        pipeline += [
          {
            '$project': {
              'city': '$_id',
              'country': '$arr_country',
              'lat': '$arr_lat',
              'lng': '$arr_lng',
              'movements': '$current_period_count',
            }
          }
        ]

      pipeline += [{'$sort': {'movements': -1}}]

      result = list(collection.aggregate(pipeline))
      return JsonResponse(result, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by country
class FlightsByCountry(View):
  def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))
      start_prev = now - timedelta(days=int(days)*2)

      should_calculate_change = CALCULATE_30_DAY_CHANGE or days not in [30]

      # Aggregation pipeline to count departures by continent within the specified time period
      pipeline = build_filter_pipeline(request, False)
      pipeline += [
        {
          '$match': {
            'createdAt': {'$gte': start_prev},
            'model': {'$nin': MODELS_TO_IGNORE},
            'arr_country': {'$ne': None, '$ne': ''},
            'dep_country': {'$ne': None, '$ne': ''},
          }
        },
        {
          '$project': {
            'country': {
              '$cond': {
                'if': {'$eq': ['$arr_country', '$dep_country']},
                'then': '$arr_country',  # No need to wrap in an array for a single country
                'else': {'$setUnion': [['$arr_country'], ['$dep_country']]}  # Use setUnion for unique countries in array
              }
            },
            'period': {
              '$cond': {
                'if': {'$gte': ['$createdAt', start_day]},
                'then': 'current',
                'else': 'previous'
              }
            }
          }
        },
        {'$unwind': '$country'},
        {
          '$group': {
            '_id': {'country': '$country', 'period': '$period'},
            'count': {'$sum': 1}
          }
        },
        {
          '$group': {
            '_id': '$_id.country',
            'counts': {
              '$push': {
                'period': '$_id.period',
                'count': '$count'
              }
            }
          }
        }
      ]

      if should_calculate_change:
        pipeline += [
          {
            '$project': {
              'country': '$_id',
              'movements': {
                '$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'current']}]
              },
              'change': {
                '$subtract': [
                  {'$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'current']}]},
                  {'$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'previous']}]}
                ]
              }
            }
          },
        ]
      else:
        pipeline += [
          {
            '$project': {
              'country': '$_id',
              'movements': {
                '$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'current']}]
              }
            }
          }
        ]

      pipeline += [{'$sort': {'movements': -1}}]

      result = list(collection.aggregate(pipeline))
      return JsonResponse(result, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights grouped by the departure and destination
class TopRoutes(View):
  def get(self, request, days):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      now = datetime.utcnow()
      start_day = now - timedelta(days=int(days))
      start_prev = now - timedelta(days=int(days)*2)

      should_calculate_change = CALCULATE_30_DAY_CHANGE or days not in [30]

      reg_filter = request.GET.getlist('reg')
      pipeline = build_filter_pipeline(request, False)
      
      if reg_filter:
        pipeline.append({'$match': {'reg_number': {'$in': reg_filter}}}) 

      # Aggregation pipeline to count departures by continent within the specified time period
      pipeline += [
        {
          '$match': {
            'createdAt': {'$gte': start_prev},
            'arr_lat': {'$ne': None, '$ne': ''},
            'arr_lng': {'$ne': None, '$ne': ''},
            'arr_city': {'$ne': None, '$ne': ''},
            'dep_lat': {'$ne': None, '$ne': ''},
            'dep_lng': {'$ne': None, '$ne': ''},
            'dep_city': {'$ne': None, '$ne': ''},
            'model': {'$nin': MODELS_TO_IGNORE}
          }
        },
        {
          '$project': {
            'dep_city': 1,
            'arr_city': 1,
            'dep_lat': 1,
            'dep_lng': 1,
            'arr_lat': 1,
            'arr_lng': 1,
            'period': {
              '$cond': {
                'if': {'$gte': ['$createdAt', start_day]},
                'then': 'current',
                'else': 'previous'
              }
            }
          }
        },
        {
          '$group': {
            '_id': {
              'dep_city': '$dep_city',
              'arr_city': '$arr_city',
              'period': '$period'
            },
            'count': {'$sum': 1},
            'dep_lat': {'$first': '$dep_lat'},
            'dep_lng': {'$first': '$dep_lng'},
            'arr_lat': {'$first': '$arr_lat'},
            'arr_lng': {'$first': '$arr_lng'}
          }
        },
        {
          '$group': {
            '_id': {
              'dep_city': '$_id.dep_city',
              'arr_city': '$_id.arr_city'
            },
            'counts': {
              '$push': {
                'period': '$_id.period',
                'count': '$count'
              }
            },
            'dep_lat': {'$first': '$dep_lat'},
            'dep_lng': {'$first': '$dep_lng'},
            'arr_lat': {'$first': '$arr_lat'},
            'arr_lng': {'$first': '$arr_lng'}
          }
        }
      ]

      if should_calculate_change:
        pipeline += [
          {
            '$project': {
              'origin': '$_id.dep_city',
              'destination': '$_id.arr_city',
              'movements': {
                '$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'current']}]
              },
              'change': {
                '$subtract': [
                  {'$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'current']}]},
                  {'$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'previous']}]}
                ]
              },
              'start_coords': ['$dep_lat', '$dep_lng'],
              'end_coords': ['$arr_lat', '$arr_lng']
            }
          }
        ]
      else:
        pipeline += [
          {
            '$project': {
              'origin': '$_id.dep_city',
              'destination': '$_id.arr_city',
              'movements': {
                '$arrayElemAt': ['$counts.count', {'$indexOfArray': ['$counts.period', 'current']}]
              },
              'start_coords': ['$dep_lat', '$dep_lng'],
              'end_coords': ['$arr_lat', '$arr_lng']
            }
          }
        ]

      pipeline += [{'$sort': {'movements': -1}}]

      result = list(collection.aggregate(pipeline))
      return JsonResponse(result, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by month by year
class FlightHistory(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['flights']

      past30DaysFilter = request.GET.get('past30Days')

      # If 30 day filter is set, fetch data from the new flights database flight_histories collection and return the number of flights for each of the last 30 days
      if past30DaysFilter:
        print("30 Day filter set, Fetching data from flight_histories collection")
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        flights_db = get_mongo_client('flights_new')
        flights_collection = flights_db['flight_histories']

        pipeline = [
          {
            '$match': { 'createdAt': {'$gte': thirty_days_ago} }
          },
          {
            '$group': {
              '_id': {
                '$dateToString': {
                  'format': '%Y-%m-%d', 'date': '$createdAt'
                }
              },
              'totalFlights': {'$sum': 1}
            }
          },
          {'$sort': {'_id': 1}}
        ]

        results = list(flights_collection.aggregate(pipeline))

        aggregateData = [
          {'date': result['_id'], 'totalFlights': result['totalFlights']}
          for result in results
        ]

        end_date = datetime.utcnow().date()
        start_date = (end_date - timedelta(days=29))
        all_dates = {(start_date + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(30)}

        for data in aggregateData:
          if data['date'] in all_dates:
            all_dates[data['date']] = data['totalFlights']

        formattedOutput = [{'date': date, 'totalFlights': flights} for date, flights in all_dates.items()]

        return JsonResponse({'data': formattedOutput}, safe=False)
      else:
        reg_filter = request.GET.getlist('reg')

        pipeline = build_filter_pipeline(request, True)

        if reg_filter:
          pipeline.append({'$match': {'registration': {'$in': reg_filter}}})
        pipeline += [
          {
            '$group': {
              '_id': {
                'month': '$month',
                'year': '$year'
              },
              'totalFlights': {'$sum': '$flights'}
            }
          },
          {'$sort': {'_id.year': 1, '_id.month': 1}}
        ]

        result = list(collection.aggregate(pipeline))
        formatted_result = {}
        for data in result:
          year = data['_id']['year']
          month = data['_id']['month']
          total_flights = data['totalFlights']

          if year not in formatted_result:
            formatted_result[year] = {}
          formatted_result[year][month] = total_flights

        return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns flight duration by hours by month by year
class FlightHoursHistory(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['flights']

      reg_filter = request.GET.getlist('reg')

      pipeline = build_filter_pipeline(request, True)

      if reg_filter:
        pipeline.append({'$match': {'registration': {'$in': reg_filter}}})

      pipeline += [
        {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year'
            },
            'hours': {'$sum': '$duration'}
          }
        },
        {'$sort': {'_id.year': 1, '_id.month': 1}}
      ]

      result = list(collection.aggregate(pipeline))
      formatted_result = {}
      for data in result:
        year = data['_id']['year']
        month = data['_id']['month']
        hours = data['hours']

        if year not in formatted_result:
          formatted_result[year] = {}
        formatted_result[year][month] = hours


      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns flight duration by distance by month by year
class FlightDistanceHistory(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['flights']

      reg_filter = request.GET.getlist('reg')

      pipeline = build_filter_pipeline(request, True)

      if reg_filter:
        pipeline.append({'$match': {'registration': {'$in': reg_filter}}})
      pipeline += [
        {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year'
            },
            'distance': {'$sum': '$distance'}
          }
        },
        {'$sort': {'_id.year': 1, '_id.month': 1}}
      ]

      print(pipeline)

      result = list(collection.aggregate(pipeline))
      formatted_result = {}
      for data in result:
        year = data['_id']['year']
        month = data['_id']['month']
        distance = data['distance']

        if year not in formatted_result:
          formatted_result[year] = {}
        formatted_result[year][month] = distance

      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights by aircraft type by month by year
class FlightsByMonthForYear(View):
  def get(self, request, year):
    try:
      db = get_mongo_client('healthcheck')
      flights_collection = db['flights']

      pipeline = [
        # Filter flights by target year
        {
          '$match': {'year': year}},
        # Lookup to join aircraft details
        {
          '$lookup': {
            'from': 'aircrafts',
            'localField': 'registration',
            'foreignField': 'registration',
            'as': 'aircraft_details'
          }
        },
        # Unwind the joined aircraft details
        {'$unwind': '$aircraft_details'},
        {
          '$match': {
            'aircraft_details.category': {'$exists': True, '$ne': ''}
          }
        },
        # Group by month and category, summing flights
        {
          '$group': {
            '_id': {
              'month': '$month',
              'category': '$aircraft_details.category'
            },
            'totalFlights': {'$sum': '$flights'}
          }
        },
        # Sort by month
        {'$sort': {'_id.month': 1}},
        # Regroup to structure the output
        {
          '$group': {
            '_id': '$_id.month',
            'categories': {
              '$push': {
                'category': '$_id.category',
                'totalFlights': '$totalFlights'
              }
            }
          }
        },
        {'$sort': {'_id': 1}}
      ]

      result = list(flights_collection.aggregate(pipeline))

      # Initialize a dictionary for each month
      month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      formatted_result = {month: {'name': month, 'total': 0} for month in month_names}

      # Fill in the data
      for data in result:
        month = month_names[data['_id'] - 1]  # Adjust month index
        category_data = data['categories']

        for cat in category_data:
          category_name = 'VIP' if cat['category'] == 'VIP Airliner' else cat['category']
          formatted_result[month][category_name] = cat['totalFlights']
          formatted_result[month]['total'] += cat['totalFlights']

      return JsonResponse({'data': list(formatted_result.values())}, safe=False)
    except Exception as e:
     return JsonResponse({'error': str(e)}, status=500)

# Returns stock prices for today (or yesterday if no data available for today)
class StockPrices(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['stocks']

      today = datetime.now().strftime("%m/%d/%Y")
      query = {'date': today}
      projection = {"changePercentage": 1, "companyName": 1, "price": 1}
      stocks = list(collection.find(query, projection))

      # If no stocks found for today, query for yesterday
      if not stocks:
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%m/%d/%Y")
        query = {'date': yesterday}
        stocks = list(collection.find(query, projection))

      # Format the results
      formatted_stocks = []
      for stock in stocks:
        ordered_stock = {
          'company': stock.get('companyName', None),
          'price': stock.get('price', None),
          'change': stock.get('changePercentage', None),
          '_id': str(stock.get('_id', ''))
        }
        formatted_stocks.append(ordered_stock)

      def custom_sort(stock):
        if stock['company'] == 'Airbus':
          return ('zzz1', )
        elif stock['company'] == 'Boeing':
          return ('zzz2', )
        else:
          return (stock['company'], )

      formatted_stocks.sort(key=custom_sort)

      return JsonResponse({'data': formatted_stocks}, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)

# Returns latest news items
class LatestNews(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['industry_news']

      query = {
        'publishedAt': {'$regex': r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$"},
        'content': {"$exists": True, "$ne": ""},
        'title': {"$exists": True, "$ne": ""},
        'url': {"$exists": True, "$ne": ""}
      }

      projection = {"title": 1, "content": 1, "url": 1, "publishedAt": 1}

      # Fetch the X most recent items by publishedAt
      newsItems = list(collection.find(query, projection).sort('publishedAt', DESCENDING).limit(25))

      formatted_news = []
      for news in newsItems:
        news['_id'] = str(news['_id'])
        news['date'] = datetime.strptime(news['publishedAt'], "%Y-%m-%d %H:%M:%S").strftime("%m/%d/%Y")
        formatted_news.append(news)

      return JsonResponse({'data': formatted_news}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns latest aircraft registrations
class Registrations(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['registration']

      sCode_filter = request.GET.getlist('sCode')
      make_filter = request.GET.getlist('make')
      model_filter = request.GET.getlist('model')

      pipeline = []
      match_conditions = {}

      if make_filter:
        match_conditions['make'] = {'$in': make_filter}

      if model_filter:
        match_conditions['model'] = {'$in': model_filter}

      if sCode_filter:
        match_conditions['mode_s_code_hex'] = {'$in': sCode_filter}

      if match_conditions:
        pipeline.append({'$match': match_conditions})

      print("REGISTRATION MATCH CONDITIONS", match_conditions);

      pipeline += [
        {
          "$match": {
            "cert_issue_date": {
              "$type": "string",
              "$nin": ["00/00/", "None"]
            }
          }
        },
        {
          "$addFields": {
            "converted_cert_issue_date": {
              "$dateFromString": {
                "dateString": "$cert_issue_date",
                "format": "%m/%d/%Y" 
              }
            }
          }
        },
        { "$sort": { "converted_cert_issue_date": -1 } },
        {'$limit': 100}
    ]

      registrations = list(collection.aggregate(pipeline))

      formatted_result = [
        {
          'aircraft': str(registration['make']) + ' ' + str(registration['model']),
          'reg': registration['reg_number'],
          'date': registration['cert_issue_date'],
          'id': str(registration['_id'])
        } for registration in registrations if registration['_id']  # Filter out any None values representing missing cities
      ]

      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns aircraft details for a given registration
class AircraftLookup(View):
  def get_flights(self, flights_collection, reg):
    flights = flights_collection.aggregate([
      {"$match": {"registration": reg}},
      {"$limit": 12}
    ])
    return list(flights)

  def get_airport_info(self, airports_collection, airport_movements):
    # Aggregate all icaoCodes from airport movements
    icao_codes = {movement["icaoCode"] for movement in airport_movements}
    
    # Fetch all airport data in a single query
    airport_data = list(airports_collection.find({"icao": {"$in": list(icao_codes)}}))
    
    # Create a map of icaoCode to airport data and movements for efficient lookup
    airport_info_map = {}
    for data in airport_data:
      icao_code = data["icao"]
      airport_info_map[icao_code] = {
        "airport_data": data,
      }
    
    # Build the airport_info list using the map for fast access, including movements
    airport_info = []
    for movement in airport_movements:
      icao_code = movement["icaoCode"]
      if icao_code in airport_info_map:
        info = airport_info_map[icao_code].copy()
        info["movements"] = movement["movements"]
        airport_info.append(info)
    
    return airport_info

  def aggregate_airport_data(self, airport_info):
    aggregated_data_list = []
    seen_airports = {}  # To track seen airports and their index in aggregated_data_list
    for info in airport_info:
      airport_name = info["airport_data"]["airportName"]
      airport_icao = info["airport_data"]["icao"]
      movements = info.get("movements", 1)
      print(airport_name, airport_icao, movements)
      if airport_icao in seen_airports:
        # Increase times_visited for an already seen airport
        index = seen_airports[airport_icao]
        aggregated_data_list[index]["times_visited"] += info.get("movements", 1)
      else:
        # Add new airport information
        airport_data = {
          "airport": airport_name,
          "country": info["airport_data"]["country"],
          "times_visited": info.get("movements", 1),
          "lat": info.get("lat"),
          "lng": info.get("long"),
          "icao": airport_icao
        }
        aggregated_data_list.append(airport_data)
        seen_airports[airport_icao] = len(aggregated_data_list) - 1  # Update seen airports with the new index

    return aggregated_data_list

  def get(self, request, reg):
    try:
      db = get_mongo_client('healthcheck')
      flights_collection = db['flights']
      aircrafts_collection = db['aircrafts']
      airports_collection = db['airports']

      # Check if registration number is valid
      aircraft_data = aircrafts_collection.find_one({"registration": reg})
      if not aircraft_data:
        print(f"Invalid registration number: {reg}")
        return JsonResponse({'message': 'Invalid registration number'})

      # Proceed only if a match is found
      print("GETTING FLIGHTS")
      flights = self.get_flights(flights_collection, reg)

      # Collect all airport movements from flights
      all_airport_movements = [movement for flight in flights for movement in flight.get("airportMovements", [])]

      # Lookup Airports and Aggregate Airport Data
      print("GETTING AIRPORT INFO")
      airport_info = self.get_airport_info(airports_collection, all_airport_movements)
      
      # Map aggregated airport data to flights
      aggregated_airport_data = self.aggregate_airport_data(airport_info)

      # Formatting the result
      formatted_result = {
        'registration': reg,
        'aircraft': aircraft_data.get('aircraft'),
        'serial_no': aircraft_data.get('serialNumber'),
        'sCode': aircraft_data.get('modeS'),
        'airports': aggregated_airport_data,
        'flights': [
          {
            'duration': flight.get('duration'),
            'flights': flight.get('flights'),
          } for flight in flights
        ]
      }

      return JsonResponse(formatted_result, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns aircraft details for a given registration
class Accidents(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['accidents_new']

      reg_filter = request.GET.getlist('reg')
      make_filter = request.GET.getlist('make')
      model_filter = request.GET.getlist('model')

      pipeline = []
      match_conditions = {}
      if reg_filter:
        match_conditions['reg_number'] = {'$in': reg_filter}

      if make_filter:
        match_conditions['make'] = {'$in': make_filter}

      if model_filter:
        match_conditions['model'] = {'$in': model_filter}

      print("ACCIDENT MATCH CONDITIONS")
      print(match_conditions)

      if match_conditions:
        pipeline.append({'$match': match_conditions})

      pipeline += [
        {
          '$match': {
            "reportDate": {"$exists": True, "$ne": "N/A"}
          }
        },
        {
          "$addFields": {
            "converted_date": {
              "$cond": {
                "if": {"$ne": ["$reportDate", "N/A"]},  # Check if reportDate is not "N/A"
                "then": {
                  "$dateFromString": {
                    "dateString": "$reportDate",
                    "format": "%m/%d/%Y"  # Adjust based on actual date format
                  }
                },
                "else": None  # Or use a placeholder value
              }
            }
          }
        },
        {
          "$sort": {
            "converted_date": -1
          }
        }
      ]

      accidents = list(collection.aggregate(pipeline))

      print(accidents)
      
      formatted_result = [
        {
          'date': accident['reportDate'],
          'severity': accident['eventType'],
          'injuries': accident['highestInjuryLevel'] if accident['highestInjuryLevel'] else '-',
          'id': str(accident['_id'])
        } for accident in accidents if accident['_id']  # Filter out any None values representing missing cities
      ]

      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns aircraft details for a given id
class GetAircraftData(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['aircraft_details']

      id_filter_strings = request.GET.getlist('aircraftIds')
      id_filter = [int(id_str) for id_str in id_filter_strings if id_str.isdigit()]

      category_filter = request.GET.getlist('category')
      name_filter = request.GET.get('aircraft_name', '')  # Get a single name query, not list)
      exact_name_filter = request.GET.get('exact_name', '')
      
      pipeline = []
      match_conditions = {}
      if id_filter_strings:
        match_conditions['id'] = {'$in': id_filter}

      if category_filter:
        match_conditions['category'] = {'$in': category_filter}

      if name_filter:
        match_conditions['aircraft_name'] = {'$regex': name_filter, '$options': 'i'}

      if exact_name_filter:
        match_conditions['aircraft_name'] = exact_name_filter

      if match_conditions:
        pipeline.append({'$match': match_conditions})

      pipeline.append({'$project': {'_id': 0}})

      if category_filter:
        pipeline.append({'$limit': 3})

      if name_filter:
        pipeline.append({'$limit': 25})

      pipeline.append({'$sort': {'aircraft_name': 1}})
      
      aircrafts = list(collection.aggregate(pipeline))

      return JsonResponse({'data': aircrafts}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns all regnumbers for a certain aircraft type
class RegNumbersForAircraft(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['aircrafts']

      make_filter = request.GET.getlist('make')
      model_filter = request.GET.getlist('model')

      pipeline = []
      match_conditions = {}

      if make_filter:
        match_conditions['make'] = {'$in': make_filter}

      if model_filter:
        match_conditions['model'] = {'$in': model_filter}

      if match_conditions:
        pipeline.append({'$match': match_conditions})

      pipeline.append({'$project': {'_id': 0, 'regNumber': '$registration'}})

      regNumbers = list(collection.aggregate(pipeline))

      # Transform the output to get a flat list of registration numbers
      regNumbersList = [reg['regNumber'] for reg in regNumbers]

      return JsonResponse({'data': regNumbersList}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns average annual hours and distance for a given registration
class GetAvgAnnualHoursAndDistance(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['flights']

      reg_filter = request.GET.getlist('reg')

      pipeline = [
        { '$match': { 'registration': {'$in': reg_filter}} },
        {
          '$group': {
            '_id': '$year',
            'totalAnnualDuration': {'$sum': '$duration'}
          }
        },
        {
          '$group': {
            '_id': None,
            'averageAnnualDuration': {'$avg': '$totalAnnualDuration'},
            'yearsCounted': {'$sum': 1}
          }
        },
        {
          '$project': {
            '_id': 0,
            'averageAnnualDuration': 1,
            'yearsCounted': 1
          }
        }
      ]

      # Execute the pipeline to calculate average annual duration
      avgDurationData = list(collection.aggregate(pipeline))

      # Calculate average distance across all matching documents without grouping
      avgDistancePipeline = [
        { '$match': { 'registration': {'$in': reg_filter}} },
        {
          '$group': {
            '_id': None,
            'averageDistance': {'$avg': '$distance'}
          }
        },
        {
          '$project': {
              '_id': 0,
              'averageDistance': 1
          }
        }
      ]

      avgDistanceData = list(collection.aggregate(avgDistancePipeline))

      # Combine the results
      result = {
        'averageAnnualDuration': avgDurationData[0]['averageAnnualDuration'] if avgDurationData else 0,
        'averageDistance': avgDistanceData[0]['averageDistance'] if avgDistanceData else 0,
      }

      return JsonResponse({'data': result}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns number of flights per day for last 60 days based on various filters
class GetLast60DaysFlights(View):
  def get(self, request):
    try:
      db = get_mongo_client('flights_new')
      collection = db['flight_histories']

      match_conditions = {
        'createdAt': {
          '$gte': datetime.now() - timedelta(days=60)
        }
      }

      city_filter = request.GET.getlist('city')
      country_filter = request.GET.getlist('country')
      airport_filter = request.GET.getlist('airport')
      origin_filter = request.GET.getlist('origin')
      destination_filter = request.GET.getlist('destination')

      if city_filter:
        match_conditions['arr_city'] = {'$in': city_filter}

      if origin_filter:
        match_conditions['dep_city'] = {'$in': origin_filter}

      if destination_filter:
        match_conditions['arr_city'] = {'$in': destination_filter}
      
      if country_filter: 
        match_conditions['arr_country'] = {'$in': country_filter}

      if airport_filter:
        match_conditions['arr_name'] = {'$in': airport_filter}
        
      pipeline = build_filter_pipeline(request, False)

      pipeline += [
        {
          '$match': match_conditions
        },
        {
          '$group': {
            '_id': {
              '$dateToString': {
                'format': '%Y-%m-%d',
                'date': '$createdAt'
              }
            },
            'flights': {'$sum': 1}  # Assuming you're counting documents as flights
          }
        },
        {
          '$project': {
            '_id': 0,
            'date': '$_id',
            'flights': 1
          }
        },
        {
          '$sort': {'date': 1}
        }
      ]

      result = list(collection.aggregate(pipeline))

      # Fill in missing days with 0 flights
      formatted_result = {}
      for i in range(60):
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        formatted_result[date] = 0

      for data in result:
        formatted_result[data['date']] = data['flights']

      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns flight data from healtcheck -> flights collection for a given regnumber for the previous year and year before that
class GetFlightsForPreviousYears(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['flights']

      reg_filter = request.GET.getlist('reg')
      pipeline = []

      if reg_filter:
        pipeline.append({'$match': {'registration': {'$in': reg_filter}}})

      pipeline.append({'$sort': {'year': -1, 'month': 1}})
      pipeline.append({'$limit': 24})

      result = list(collection.aggregate(pipeline))

      formatted_result = [{'month': item['month'], 'airportMovements': item['airportMovements']} for item in result]

      return JsonResponse({'data': formatted_result}, safe=False, json_dumps_params={'default': json_util.default})
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)
        
# Returns serial number, country of origin, year of manufacture and hours flown this year for a group of registrations
class GetFleetData(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      flights_collection = db['flights']
      registrations_collection = db['registration']

      reg_filter = request.GET.getlist('reg')

      # Registrations collection pipeline
      registration_pipeline = [
        {'$match': {'reg_number': {'$in': reg_filter}}},
        {'$group': {
          '_id': '$reg_number',
          'serial_number': {'$first': '$serial_number'},
          'year': {'$first': '$mfr_year'}
        }}
      ]

      registration_details = list(registrations_collection.aggregate(registration_pipeline))

      # Fetch flights for previous calendar year
      hours_pipeline = [
        {
          '$match': {
            'registration': {'$in': reg_filter},
            'year': datetime.now().year - 1
          }
        },
        {
          '$group': {
            '_id': '$registration',
            'hours': {'$sum': '$duration'},
          }
        }
      ]

      hours_flown = list(flights_collection.aggregate(hours_pipeline))

      # Combine the results
      result = []
      for reg in reg_filter:
        reg_details = next((item for item in registration_details if item['_id'] == reg), {})
        hours = next((item for item in hours_flown if item['_id'] == reg), {})

        result.append({
          'reg': reg,
          'serial_number': reg_details.get('serial_number', ''),
          'year': reg_details.get('year', ''),
          'hours': hours.get('hours', 0)
        })

      return JsonResponse({'data': result}, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns the number of flights and number of flight hours for a given registration vs a group of registrations, returning the number of flights and number of hours for each month of the previous year
class GetFleetActivity(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      flights_collection = db['flights']

      reg_numbers = request.GET.getlist('reg')

      last_year = datetime.now().year - 1

      # Define the pipeline for aggregation
      pipeline = [
        {
          '$match': {
            'year': last_year,
            'registration': {'$in': reg_numbers}
          }
        },
          {
            '$group': {
              '_id': {
                'registration': '$registration',
                'month': '$month'
              },
              'total_flights': {'$sum': '$flights'},
              'total_duration': {'$sum': '$duration'}
            }
          },
          {
            '$project': {
              '_id': 0,
              'registration': '$_id.registration',
              'month': '$_id.month',
              'flights': '$total_flights',
              'duration': '$total_duration'
            }
          },
          {
            '$sort': {'registration': 1, 'month': 1}
          }
      ]

      result = list(flights_collection.aggregate(pipeline))

      return JsonResponse(result, safe=False)
    except Exception as e:
      print(e)
      return JsonResponse({'error': str(e)}, status=500)

# Returns last 12 months of flights for a given registration
class GetLast12MonthsFlights(View):
  def get(self, request):
    try:
      db = get_mongo_client('healthcheck')
      collection = db['flights']

      reg_filter = request.GET.getlist('reg')

      pipeline = build_filter_pipeline(request, True)

      if reg_filter:
        pipeline.append({'$match': {'registration': {'$in': reg_filter}}})

      pipeline += [
        {
          '$group': {
            '_id': {
              'month': '$month',
              'year': '$year'
            },
            'hours': {'$sum': '$duration'},
            'distance': {'$sum': '$distance'},
            'flights': {'$sum': '$flights'}
          }
        },
        {'$sort': {'_id.year': 1, '_id.month': 1}}
      ]

      result = list(collection.aggregate(pipeline))
      formatted_result = {}
      for data in result:
        year = data['_id']['year']
        month = data['_id']['month']
        hours = data['hours']

        if year not in formatted_result:
          formatted_result[year] = {}
        formatted_result[year][month] = {
          'hours': hours,
          'distance': data['distance'],
          'flights': data['flights']
        }


      return JsonResponse({'data': formatted_result}, safe=False)
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)
    
class GetAIIndustryOverview(View):
  def get(self, request, question):
    print("WE ARE INSIDE THE QUERY")
    print("YEYEYEYEYEYYEYEYEY")
    try:
      print(request.GET)
      db = get_mongo_client('healthcheck')
      decoded_url = unquote(request.build_absolute_uri())
      query_params = parse_qs(urlparse(unquote(decoded_url)).query)
      username = query_params['userlogin'][0]
      print(username)
      limit_collection = db['question_limits']
      result = limit_collection.update_one({'name': username}, {'$inc': {'limitation': -1}})
      collection = db["industry_news"]
      days = request.GET.get('days')
      if(not days):
        days = 30
      today = datetime.now().strftime("%Y-%m-%d")  # Changed format to match 'publishedAt'
      start_of_period = (datetime.now() - timedelta(days=days-1)).strftime("%Y-%m-%d") + " 00:00:00"
      end_of_period = today + " 23:59:59"

      query = {
        'publishedAt': {'$gte': start_of_period, '$lte': end_of_period}
      }
      context = list(collection.find(query, {'_id' : 0}))
      
      scores_collection = db["health_score"]
      scores_historical_info = list(scores_collection.find({}, {'_id' : 0}))
      # print("\n WE ARE INSIDE \n")
      overall_context = "NEWS ARE: " + str(context) + ". AND SCORES FOR EACH MONTH ARE:" + str(json.dumps(scores_historical_info))
      
      print("overall_context is " , overall_context)
      return StreamingHttpResponse(
        AI.get_industry_summary(str(overall_context), question),
        content_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="somefilename.json"'},
      )
    except Exception as e:
      print("ERROR IS " , e)
      return JsonResponse({'error': str(e)}, status=500)

import json
class GetAIAircraftLookup(View):
  def get_flights(self, flights_collection, reg):
    flights = flights_collection.aggregate([
      {"$match": {"registration": reg}},
      {"$limit": 12}
    ])
    return list(flights)
  def get_airport_info(self, airports_collection, airport_movements): 
    airport_info = []
    for movement in airport_movements:
      airport_data = airports_collection.find_one({"icao": movement["icaoCode"]})
      if airport_data:
        airport_info.append(airport_data)
    return airport_info
  def aggregate_airport_data(self, airport_info):
    aggregated_data = {}
    for info in airport_info:
      airport_name = info.get("airportName")
      if airport_name in aggregated_data:
        aggregated_data[airport_name]["count"] += 1
      else:
        aggregated_data[airport_name] = {
          "lat": info.get("lat"),
          "long": info.get("long"),
          "count": 1
        }
    return aggregated_data
  def get(self, request, reg, question):
    try:
      # print("I'm HERE!" ,reg)
      db = get_mongo_client('healthcheck')
      flights_collection = db['flights']
      aircrafts_collection = db['aircrafts']
      airports_collection = db['airports']
      detailed_collection = db['aircraft_details']

    
      # Check if registration number is valid
      aircraft_data = aircrafts_collection.find_one({"registration": reg})
      if not aircraft_data:
        print(f"Invalid registration number: {reg}")
        return JsonResponse({'message': 'Invalid registration number'})

      aircraft_model = detailed_collection.find_one({"aircraft_name" : aircraft_data['aircraft']}, {'_id' : 0})
      
      if not aircraft_model:
        print("NOT SUCH MODEL DAMN")
      # Proceed only if a match is found
      flights = self.get_flights(flights_collection, reg)

      # Lookup Airports and Aggregate Airport Data
      for flight in flights:
        airport_info = self.get_airport_info(airports_collection, flight.get("airportMovements", []))
        flight["airport_info"] = self.aggregate_airport_data(airport_info)

      # Formatting the result
      formatted_result = {
        'registration': reg,
        'aircraft': aircraft_data.get('aircraft'),
        'serial_no': aircraft_data.get('serialNumber'),
        'sCode': aircraft_data.get('modeS'),
        'flights': [
          {
            'duration': flight.get('duration'),
            'flights': flight.get('flights'),
            'flight_details': flight.get('airport_info')
          } for flight in flights
        ]
      }
      total_context = 'INFORMATION: Here is the information about aircraft model: ' + json.dumps(aircraft_model) + "Here is information about it flights " + json.dumps(formatted_result)
      # total_context = 'X'
      return StreamingHttpResponse(
         AI.get_aircraft_lookup(str(total_context), question),
        content_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="somefilename.json"'},
      )

    except Exception as e:
      print("error is " , e)
      return JsonResponse({'error' : str(e)}, status=500)
class GetAIAircraftOverview(View):

  def get_flight_data(self, aircraft_name):
    db = get_mongo_client('healthcheck')
    coll = db['aircrafts']
    print('aricraft_name ', aircraft_name)
    result = list(coll.aggregate([
      {
        '$match' : {'aircraft': aircraft_name}
      },
      {
        '$lookup' : {
          'from' : 'flights',
          'localField' : 'registration',
          'foreignField' : 'registration',
          'as' : 'flights'
        }
      },{
            '$unwind': '$flights'  # Unwind the array for further grouping
        },{
        '$group' : {
          '_id' : {
            'year' : '$flights.year',
            'month' : '$flights.month'
          },
          'flights' : {'$sum' : '$flights.flights'},
          'distance' : {'$sum' : '$flights.distance'},
          'duration' : {'$sum' : '$flights.duration'},
          'durationRunway' : {'$sum' : '$flights.distanceRunway'},
        }
      },{
        '$limit' : 300
      },{
        '$project': {
            '_id': 0,  # Exclude the _id field
            'year': '$_id.year',
          'month': '$_id.month',
          'distance': 1,
          'duration': 1,
          'durationRunway': 1,
          'flights': 1
        }
    
      }
    ]))
    return result

  def get_aircraft_details(self, id_str):
      try:
        db = get_mongo_client('healthcheck')
        collection = db['aircraft_details']
        id_filter = [int(id_str)]

        pipeline = []
        match_conditions = {}
        match_conditions['id'] = {'$in': id_filter}

        if match_conditions:
          pipeline.append({'$match': match_conditions})

        pipeline.append({'$project': {'_id': 0}})

        pipeline.append({'$sort': {'aircraft_name': 1}})
        
        aircrafts = list(collection.aggregate(pipeline))

        return aircrafts[0]
      except Exception as e:
        raise e
  def get(self, request, aircraft, question):
    try:
      aircraft_information = self.get_aircraft_details(aircraft)
      
      # flights_info = self.get_flight_data(aircraft['aircraft_name'])
      flights_info = self.get_flight_data(aircraft_information['aircraft_name'])
      
      return StreamingHttpResponse(
         AI.get_info_about_aircraft(str(aircraft_information)+str(flights_info), question),
        content_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="somefilename.json"'},
      )

    except Exception as e:
      print("error ", str(e))
      return JsonResponse({'error': str(e)}, status=500)
    
#give data in format %m/%y
class GetIndustryHealth(View):
  def get(self, request):
      try:
        db = get_mongo_client('healthcheck')
        collection = db['health_score']
        specific_month = request.GET.getlist('month')
        if specific_month:
          filter = {'date' : specific_month}
        else:
          filter = {'date' : '11/2023'}
        print("the filter is ", filter)
        responses = list(collection.find(filter, {'_id' : 0}))
        result = '' if responses == [] else responses[0]
        for keys in ['health_score', 'stability_score','future_score', 'activity_score']:
          result[keys] = round(result[keys])
        print("\nResult is\n\n", result)
        return JsonResponse({'data': result}, safe=False)
      except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
class GetAircraftHealth(View):
  def get(self, request):
      try:
        db = get_mongo_client('healthcheck')
        collection = db['health_aircraft']
        serial_number = request.GET.get('serial_number')
        if serial_number:
          if(serial_number.isdigit()):
            serial_number = int(serial_number)

          filter = {'serial_number' : serial_number}
          responses = list(collection.find(filter, {'_id' : 0}))
          result = '' if responses == [] else responses[0]
         
          for keys in ['health_score', 'transaction_score','hours_score', 'accident_score']:
            result[keys] = round(result[keys])
          return JsonResponse({'data': result}, safe=False)
        else:
          return JsonResponse({'error': 'no such serial number'}, status=404)
      except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
 