#news addition script
from pymongo import MongoClient
from pprint import PrettyPrinter
import AI
from datetime import datetime, timedelta

printer = PrettyPrinter()
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

def have_news(period = None):
    if(period is None):
        today = datetime.now().strftime("%Y-%m-%d")  # Changed format to match 'publishedAt'
        period = (today + " 00:00:00", today + " 23:59:59")
    query = {'publishedAt' : {'$gte' : period[0], '$lte' : period[1]}}
    try:
        db = get_mongo_client('industry_news')
        collection = db['industry_news']
        result = collection.count_documents(query)
        return result > 0
    except Exception as e:
       print("error while have_news ", e)

def add_new_data(data):
    print("adding data is ", data)
    try:
        db = get_mongo_client('industry_news')
        collection = db['industry_news']
        
        collection.insert_many(data, ordered=False)
    except Exception as e:
       print("Got error while adding news. If duplicates that is okay: ", e)

if(have_news() == False):
    today = datetime.now().strftime("%Y-%m-%d")
    upcoming_news = AI.get_news_day(today)
    print(upcoming_news)
    add_new_data(upcoming_news)
