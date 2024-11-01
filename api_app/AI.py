from openai import OpenAI
import json
from pprint import PrettyPrinter
import os
from pymongo import MongoClient
from datetime import datetime
from urllib.parse import unquote
printer = PrettyPrinter()

YOUR_API_KEY = "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"
OPENAI_API = "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"
client_preplexity = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")
client_openai = OpenAI(api_key=OPENAI_API)
# demo chat completion without streaming

# print(response)
CONN_STRINGS = {
  'healthcheck': {
    'uri': 'mongodb+srv://premiumcpp:sYQv5RBhqp0xA0iK@healthcare.k9byvtu.mongodb.net/',
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

def extract_JSON(data):
    messages = [
        {
            "role" : "system",
            "content" : "You're give a data that's almost JSON(it means either already JSON or in table). Parse JSON array from it. You have to provide JSON array of JSON objects each of them should only have these properties: title, content, url, publishedAt(provide data in yyyy-mm-dd hh:mm:ss format UTC-0 time)"
        },
        {
            "role" : "user",
            "content" : data
        }
    
    ]
    response = client_openai.chat.completions.create(
         model="gpt-3.5-turbo-0125",
         response_format={ "type": "json_object" },
         messages=messages
    )
    # print(response.choices[0].message.content)
    obj = json.loads(response.choices[0].message.content)
    printer.pprint(obj)
    return obj
    # print(" so to understand ", obj)

def get_news_day(period):
    arr = []
    variations = ['Please tell me about the news of aviation industry posted', 'Tell me about improvements of aviation industry reported on', 'Tell me about bad news for aviation industry posted on', 'Tell me about news about the future of aviation which were posted on']
    data = []
    for tell in variations:
        messages = [
            {
                "role" : "system",
                "content" : "Be precise and concise in your responses. Provide response in JSON. You answering only about AVIATION INDUSTRY"
            },
            {
                "role": 'user',
                "content" : f"{tell} {period}? If none news founed about aviation industry, just say it like that. Don't provide unrelated news. I'm interested only in news posted on date: 2024-02-20. Give me all with the links. Provide answer in JSON format where each of the news has fields: title, content, url, publishedAt(please the date in format yyyy-mm-dd hh:mm:ss UTC-0 time)"
            }
        ]
        response = client_preplexity.chat.completions.create(
        model="pplx-7b-online",
        messages=messages,
        max_tokens=4000
        )
        obj = extract_JSON(response.choices[0].message.content)

        if('news' in obj):
            obj = obj['news']
        if('articles' in obj):
            obj = obj['articles']
        
        if isinstance(obj, list):
            data += obj
        else:
            data.append(obj)

    return data
def get_industry_summary(context, question='What has happened of note within the private aviation industry within the past 7 days? Tell me about any relevant news'):
    messages = [
        {
            "role" : "system",
            "content" : "You are helpful assistant that wants to provide insight on what's happenning in aviation industry. You will be provided with relevant information of recent news with dates, also with flight activity, you need to present this information with some summary. Please attach links where possible."
        },
        {
            "role" : "system",
            "content" : """You are also will be given data on Health of the industry scores. It includes four metrics: Current Health, Future Outlook, Market Stability.
                Stability score: Assesed upon the number of transactions happening with jets in a period of time. Acqusitions, sellings, new registration or deregistration. If the activity is persistent among suffiecent amount of time, then the market is stable, othewise it's not. Also takes into consideration actions of aviation companies.
                Flight activity score: Based on the flight activity each month among all private jets registered in our private database. It takes into considaration: number of flights, the total distance, number of hours in the air, transitions of a jet between airports, active flying days for a jet.
                Future outlook: Is a prediction of what's going to happen in the upcoming month with the industry. It assess all of the information about flights, transactions, news, actions. It uses a lot of Data Science methods such as Mooving Averages and Recurrent Neural Networks. All on our extensive data.
                Current Health score: is a combined metric of all 3 above mentioned. It takes it with different weights to give an overall picture.
                You will be provided with these scores for each of the month in previous 5 years. You might be asked to analyze them, so feel free to do so. If you don't have some knowledge you can elaborate.
            """
        },
        {
            "role" : "assistant",
            "content" : context
        },
        {
            "role" : 'user',
            "content" : question
        }
    ]
    stream = client_openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True
    )
    response = ''
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            response += chunk.choices[0].delta.content
            yield chunk.choices[0].delta.content
    try:
        db = get_mongo_client('healthcheck')
        coll = db['ai_requests']
        request = {
            'question' : unquote(question),
            'response' : response,
            'time' : datetime.now(),
            'section' : 'industry'
        }
        coll.insert_one(request)
    except Exception as e:
        print("error while reading result of AI query to database " , e)

def get_info_about_aircraft(context, question):
    messages = [
        {
            "role" : "system",
            "content" : "You're an assistant advising person about jets. Be precise and consise in your responses." 
        }
    ]
    if(context):
        messages.append({
            "role" : "system",
            "content" : f"You're talking only about the specific jet. You know its name, here is information about it: {context}. When user refers to this jet, he's talking about the jet you just got information about"
        })
    messages.append({
        "role" : "user",
        "content" : question
    })
    
    stream = client_openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True
    )
    response = ''
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            response += chunk.choices[0].delta.content
            yield chunk.choices[0].delta.content
    try:
        db = get_mongo_client('healthcheck')
        coll = db['ai_requests']
        request = {
            'question' : unquote(question),
            'response' : response,
            'time' : datetime.now(),
            'section' : 'model_aircraft'
        }
        coll.insert_one(request)
    except Exception as e:
        print("error while reading result of AI query to database " , e)
def get_aircraft_lookup(context, question):
    messages = [
        {
            "role" : "system",
            "content" : "You're an assistant advising person about jets. Be precise and consise in your responses. There are some metrics that users sees when talks to you, they are called: Health Score metrics. It has 4 metrics: overall score, hours score, transaction history, accident history. So it's calculated specifically for this jet based on historical data, the hours score is calculated based on an advised number of hours per year a private jet should fly. Transaction history is evaluated, so if the aircraft is sold and bought many times it lowers the score. Overall score is a compound of all of these metrics. If user asks tell him about them" 
        }
    ]
    if(context):
        messages.append({
            "role" : "system",
            "content" : f"You're talking only about this specific jet. You know its name, here is information about it: {context}. When user refers to this jet, he's talking about the jet you just got information about. The user will ask about its flights, number of hours and stuff like that, use provided information to answer."
        })
    

    messages.append({
        "role" : "user",
        "content" : question
    })
    
    stream = client_openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True
    )
    response = ''
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            response += chunk.choices[0].delta.content
            yield chunk.choices[0].delta.content
    try:
        db = get_mongo_client('healthcheck')
        coll = db['ai_requests']
        request = {
            'question' : unquote(question),
            'response' : response,
            'time' : datetime.now(),
            'section' : 'aircraft_lookup'
        }
        coll.insert_one(request)
    except Exception as e:
        print("error while reading result of AI query to database " , e)