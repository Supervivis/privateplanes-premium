
from pymongo import MongoClient
from dateutil.relativedelta import relativedelta
from sklearn.preprocessing import StandardScaler
import numpy as np
from datetime import datetime, timedelta


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
  'industry_news': {
     'uri' : 'mongodb+srv://daniil:M8G0BhJ9L3RDEd5@healthcare.k9byvtu.mongodb.net/',
     'db': 'Healthcheck'
  }
}

def get_mongo_client(db_key):
  if db_key in CONN_STRINGS:
    print(f"Connecting to '{db_key}' database...")
    client = MongoClient(CONN_STRINGS[db_key]['uri'])
    return client[CONN_STRINGS[db_key]['db']]
  else:
    print("Database configuration for '{db_key}' not found.")
    raise ValueError(f"Database configuration for '{db_key}' not found.")



class MonthScores:
   def __init__(self, flights = 0, miles = 0, estimated_costs = 0, duration = 0):
      self.flights = flights
      self.miles = miles
      self.estimated_costs = estimated_costs
      self.duration = duration
   def add(self, registrations, costs, reg_month_result):
      self.flights += reg_month_result['flights']
      self.miles += reg_month_result['distance']
      self.duration += reg_month_result['duration']
      aircraft = reg_month_result["registration"]
      if(aircraft in registrations) and (registrations[reg_month_result["registration"]] in costs):
            self.estimated_costs += costs[registrations[reg_month_result["registration"]]].calc(reg_month_result['duration'])
     
   def score_1(self):
      pass
   
class AircraftCost:
    fixed = 0
    hourly = 0
    def add(self, obj):
      # anual spendings
      annual_spendings = ['annual_total']
      hourly_spendings = ['hourly_total']
      regions = ['NA', 'EU', 'AS']
      
      annual_avrg = 0
      for spending in annual_spendings:
        for region in regions:
            annual_avrg += obj[region+'_'+spending]  
      annual_avrg /= len(regions)

      hourly = 0
      for spending in hourly_spendings:
         for region in regions:
            hourly += obj[region+'_'+spending]
      hourly /= len(regions)
      self.fixed = annual_avrg
      self.hourly = hourly

    def calc(self, hours):
       return self.fixed + hours * self.hourly
    def __init__(self , obj = None):
      if(obj is not None):
        self.add(obj)

def get_flights_information():
    aircraft_costs = dict()
    reg_aircraft_name = dict()
    try:
        db = get_mongo_client('industry_news')
        collection = db['aircraft_details']

        projection = {'aircraft_name' : 1}
        regions = ['NA', 'EU', 'AS']
        for region in regions:
            projection[region+'_'+'annual_total'] = 1
            projection[region+'_'+'hourly_total'] = 1
            
        records = list(collection.find({}, projection))
        for aicraft in records:
            aircraft_costs[aicraft['aircraft_name']] = AircraftCost(aicraft)
    except Exception as e:
        print("Error while getting aicraft_details", e)


    try:
        db = get_mongo_client('industry_news')
        collection = db['aircrafts']
        for record in collection.find({}, {'registration' : 1, 'aircraft' : 1}):
            reg_aircraft_name[record['registration']] = record['aircraft']
    except Exception as e:
        print("error occured while getting aircrafts", e)


    try:
        db = get_mongo_client('industry_news')
        collection = db['registration']
        records = list(collection.find({}, {'reg_number': 1, 'cpp_name' : 1}))
        for reg in records:
                reg_aircraft_name[reg['reg_number']] = reg['cpp_name']
    except Exception as e:
        print("Error while getting registration", e)

    try:
        db = get_mongo_client('industry_news')
        collection = db['flights']
        records = list(collection.find({}))

        month_info = dict()
        for record in records:
            cur_month = str(record['month'])+'/'+str(record['year'])

            if(not cur_month in month_info):
                month_info[cur_month] = MonthScores()
            month_info[cur_month].add(reg_aircraft_name,aircraft_costs, record)

    except Exception as e:
        print("Error occured, ", e)
    
    data_by_month = []
    for month in month_info.keys():
        obj = month_info[month]
        obj.month = month
        data_by_month.append(obj)
    return data_by_month




def standardize(arr):
    arr = arr.astype(float)
    cpy = np.copy(arr)
    return np.array((cpy - np.min(cpy)) / (np.max(cpy) - np.min(cpy) + 0.000001))
def zscale(arr):
    arr = np.array(arr)
    arr = arr.astype(float)
    scaler = StandardScaler()
    new_arr = scaler.fit_transform(arr.reshape(-1,1)).reshape(-1)
    return new_arr
def merge(score, months):
    assert len(score) == len(months)
    res = dict()

    for i in range(len(months)):
        res[months[i]] = score[i]
    return res
# array of objects with parameters, month, flights, miles, duration, expected_costs
def assess_flight_activity_n_future(data):
    # print("asses fun ", data[0].duration, data[0].miles)
    data.sort(key=lambda a:(int(a.month.split('/')[1]), int(a.month.split('/')[0])))

    durations = [obj.duration for obj in data]
    distances = [obj.miles for obj in data]
    flights = [obj.flights for obj in data]

    durations = standardize(np.array(durations))
    distances = standardize(np.array(distances))
    flights = standardize(np.array(flights))

    metric = [0] * durations.size
    for i in range(durations.size):
        metric[i] = durations[i] + distances[i] + flights[i]




    x = [obj.month for obj in data]
    months = x
    metric = np.array(metric)
    metric = standardize(metric) * 100

    # here is the flights score
    flight_activity = metric
    period = 4
    moving_average = [0] * len(data)

    smooth = 2 / (period + 1)

    for i in range(period-1, len(data)):
        moving_average[i] = np.mean(metric[i-period+1:i])
    for i in range(period, len(data)):
        moving_average[i] = moving_average[i] * smooth / (1 + period) + moving_average[i-1]*(1-smooth/(1+period))
    

    predict = [0] * len(data)

    # print(" MOVING AVERAGE \n" , moving_average)

    for i in range(2*period, len(data)):
        mean = np.mean(moving_average[i-period:i-1])
        predict[i] = mean
    predict = np.array(predict)
    deltas = []


    for i in range(2*period, len(data)):
        deltas.append(predict[i] - moving_average[i - 1])
    deltas = np.array(deltas)
    future_outlook = standardize(zscale(deltas))*100
    future_outlook = np.concatenate((np.zeros(flight_activity.size-future_outlook.size), future_outlook))

    
    return merge(flight_activity, months), merge(future_outlook, months) 





def format_date(date):
   try:
      val = int(date)
      return datetime(1900,1,1) + timedelta(days=val-1)
   except ValueError:
      return datetime.strptime(date , '%m/%d/%Y')

def get_reg_dates():
   try:
      db = get_mongo_client('healthcheck')
      collection = db['registration']
      projection = {
         'last_action_date' : 1
      }
      records = list(collection.find({}, projection))
      formatted_form = []
      for record in records:
        if(record['last_action_date'] != ' '):
            formatted_form.append(format_date(record['last_action_date']))
      return formatted_form
   except Exception as e:
      print("error while getting registration", e)

import matplotlib.pyplot as plt
def assess_stability(data):
    by_date = dict()
    for reg_date in data:
        date=str(reg_date.month)+'/'+str(reg_date.year)
        if(not (date in by_date)):
            by_date[date] = 0
        by_date[date] = by_date[date] + 1
    cnt_month = []
    for month in by_date.keys():
        cnt_month.append((month, by_date[month]))
    cnt_month.sort(key=lambda a: (int(a[0].split('/')[1]), int(a[0].split('/')[0])))
    period = 3
    
    cnt_series = [tup[1] for tup in cnt_month]
    overall = cnt_series
    cnt_series = standardize(np.array(cnt_series))*100
    moving_averages = np.zeros(cnt_series.shape[0])
    deviation = np.zeros(cnt_series.shape[0])
    for i in range(period-1, cnt_series.shape[0]):
        moving_averages[i] = np.mean(cnt_series[i-period+1:i])
    for i in range(period-1, cnt_series.shape[0]):
        deviation[i] = np.sqrt(np.mean((cnt_series[i-period+1:i]-moving_averages[i])**2))
    stability_score = (1-standardize(deviation))*100
    
    x = [tup[0] for tup in cnt_month]
    x = np.array(x)

    return merge(stability_score, x)

def get_sorted_month_list(dictionary):
    res = []
    for month in dictionary.keys():
        res.append((month, dictionary[month]))
    res.sort(key=lambda a: (int(a[0].split('/')[1]), int(a[0].split('/')[0])))
    
    vals = np.array([tup[1] for tup in res])
    months = [tup[0] for tup in res]

    return months, vals
def get_healthy_score(flights_score, future_score,  stability_score):
    total_score = dict()
    # those are trainable params for ML model
    FLIGHT_WEIGHT = 0.6
    STABILITY_WEIGHT = 0.3
    FUTURE_WEIGHT = 0.1
    for val in flights_score.keys():
        if(not (val in total_score)):
            total_score[val] = 0
        total_score[val] += flights_score[val] * FLIGHT_WEIGHT
    for val in future_score.keys():
        if(not (val in total_score)):
            total_score[val] = 0
        total_score[val] += future_score[val] * FUTURE_WEIGHT
    for val in stability_score.keys():
        if(not (val in total_score)):
            total_score[val] = 0
        total_score[val] += stability_score[val] * STABILITY_WEIGHT

    months, scores = get_sorted_month_list(total_score)

    scores = standardize(zscale(scores))*100
    return merge(scores, months)

def add_scores(healty_score, future_score, stability_score, flights_score):
    summarized = dict()
    fields = ['health_score', 'future_score', 'stability_score', 'activity_score']
    ind = 0
    for dictionary in [healty_score, future_score, stability_score, flights_score]:
        for month in dictionary.keys():
            if not (month in summarized):
                summarized[month] = dict()
            summarized[month][fields[ind]] = dictionary[month]
        ind += 1
    final_objects = []
    for month in summarized.keys():
        obj = summarized[month]
        obj['date'] = month
        final_objects.append(obj)
    try:
        db = get_mongo_client('industry_news')
        collection = db['health_score']
        collection.delete_many({})
        collection.insert_many(final_objects)
    except Exception as e:
        print("error while inserting data", e)
    print("success on recalculations of industry health scores")

def calculate_health_scores():
    stability_score = assess_stability(get_reg_dates())
    flights_score, future_score = assess_flight_activity_n_future(get_flights_information())
    healthy_score = get_healthy_score(flights_score, future_score, stability_score)
    add_scores(healthy_score, future_score, stability_score, flights_score)


def calculate_aircraft_scores():
    regs = []
    try:
        db = get_mongo_client('industry_news')
        collection = db['registration']
        proj = {'serial_number' : 1,'reg_number' : 1}
        regs = list(collection.find({}, proj))
    except Exception as e:
        print("error while getting regs ", e)
    accidents = []
    try:
        db = get_mongo_client('industry_news')
        collection = db['accidents']
        proj = {'nNumber' : 1}
        accidents = list(collection.find({}, proj))
    except Exception as e:
        print("error while getting regs ", e)
    flights = []
    try:
        db = get_mongo_client('industry_news')
        collection = db['flights']
        proj = {'registration' : 1, 'duration' : 1, 'year' : 1, 'month' : 1}
        filter = [{'$group':
                   {
                       '_id':{
                           'registration' : '$registration',
                       },
                       'duration': {'$sum' : '$duration'},
                       'startDate' : {'$min' : {'$dateFromParts': {'year': '$year', 'month' : '$month'}}} 
                   }
        }]
        flights = list(collection.aggregate(filter))
    except Exception as e:
        print("error while getting flights", e)
    
    data_by_reg = dict()
    for flights_summary in flights:
        date = min(datetime.now(), flights_summary['startDate'])
        # date = datetime.fromisoformat(flights_summary['startDate'])
        # print("the date is ", date)
        reg = flights_summary['_id']['registration']
        if not (reg in data_by_reg):
            data_by_reg[reg] = {'start_date' : datetime.now(), 'accidents' : 0, 'total_hours' : 0}
        data_by_reg[reg]['total_hours'] = flights_summary['duration']
        data_by_reg[reg]['start_date'] = min(date, data_by_reg[reg]['start_date'])
    for accidents in accidents:
        reg = accidents['nNumber']
        if not (reg in data_by_reg):
            data_by_reg[reg] = {'start_date' : datetime.now(), 'accidents' : 0, 'total_hours' : 0}
        data_by_reg[reg]['accidents'] += 1

    data_by_serial = dict()
    for registration in regs:
        reg = registration['reg_number']
        serial = registration['serial_number']
        if not (serial in data_by_serial):
            data_by_serial[serial] = {'transactions' : 0, 'start_date' : datetime.now(), 'total_hours' : 0, 'accidents' : 0}
        data_by_serial[serial]['transactions'] += 1

        if reg in data_by_reg:
            data_by_serial[serial]['start_date'] = min(data_by_serial[serial]['start_date'], data_by_reg[reg]['start_date'])
            data_by_serial[serial]['total_hours'] += int(data_by_reg[reg]['total_hours'])
            data_by_serial[serial]['accidents'] += int(data_by_reg[reg]['accidents'])
    mx = 0

    for serial in data_by_serial.keys():
        dt = relativedelta(datetime.now(), data_by_serial[serial]['start_date'])
        period = dt.years * 12 + dt.months
        data_by_serial[serial]['avg_hours'] = 0
        if(period > 0):
            data_by_serial[serial]['avg_hours'] = data_by_serial[serial]['total_hours'] / period
        else:
            assert data_by_serial[serial]['total_hours'] == 0
    pairs = list(data_by_serial.items())
        # print("period is ", period, ' ', data_by_serial[serial]['start_date'], data_by_serial[serial]['transactions'])
    cnt_transactions = np.array([obj[1]['transactions'] for obj in pairs])
    score_transactions = np.sqrt(cnt_transactions)
    score_transactions = (1 - standardize(cnt_transactions)) * 100


    avg_hours = np.array([obj[1]['avg_hours'] for obj in pairs])
    score_hours = standardize(zscale(avg_hours)) * 100
    
    accidents = np.array([obj[1]['accidents'] for obj in pairs])
    accidents = accidents
    score_accidents =  np.minimum(0.7*np.ones(accidents.shape[0]),(1 - standardize(zscale(accidents)))) * 100 / 0.7

    overall_score = 0.7 * score_hours + 0.2 * score_transactions + 0.1 * score_accidents
    overall_score = standardize(zscale(overall_score)) * 100

    ind = 0
    complete_objects = []
    for pair in pairs:
        serial_number = pair[0]
        obj = {
            'serial_number' : serial_number,
            'health_score' : overall_score[ind],
            'transaction_score' : score_transactions[ind],
            'hours_score' : score_hours[ind],
            'accident_score' : score_accidents[ind]
        }
        complete_objects.append(obj)
        ind += 1
    # should delete it before
    try:
        db = get_mongo_client('industry_news')
        collection = db['health_aircraft']
        collection.delete_many({})
        collection.insert_many(complete_objects)
    except Exception as e:
        print("error while inserting into health_aircraft ", e)
    print("success on recalculations of aircraft health scores")


calculate_health_scores()
calculate_aircraft_scores()
