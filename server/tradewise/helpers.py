from functools import wraps
from .templates import view_error
from dotenv import load_dotenv
import os
import requests
import datetime
from dateutil.relativedelta import relativedelta
from openai import OpenAI
from .prompt import SYSTEM_PROMPT, INITIAL_MESSAGE
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

load_dotenv()


def login_required(f):
    @wraps(f)
    def decorated_function(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return view_error('User not authenticated', 401)
        return f(request, *args, **kwargs)
    return decorated_function


def require_POST(f):
    @wraps(f)
    def decorated_function(request, *args, **kwargs):
        if request.method != 'POST':
            return view_error('Method not allowed', 405)        
        return f(request, *args, **kwargs)
    return decorated_function


def stock_data(symbol, checking_profile=False):
    TWELVE_DATA_API_URL = os.getenv('TWELVE_DATA_API_URL')
    TWELVE_DATA_API_KEYS = os.getenv('TWELVE_DATA_API_KEYS').split(',') 

    if checking_profile:
        for api_key in TWELVE_DATA_API_KEYS:
            url = f'{TWELVE_DATA_API_URL}/quote?symbol={symbol}&apikey={api_key}'
            response = requests.get(url)
            data = response.json()
            if 'code' in data:
                continue
            return symbol.upper(), data['close'], data['change'], data['percent_change'], data['is_market_open']
    else:
        for api_key in TWELVE_DATA_API_KEYS:
            url = f'{TWELVE_DATA_API_URL}/price?symbol={symbol}&apikey={api_key}'
            response = requests.get(url)
            data = response.json()
            if 'code' in data:  
                continue
            return symbol.upper(), data['price']
    return 'Failed to fetch data', 500


def company_profile(symbol):
    FMP_API_URL = os.getenv('FMP_API_URL')
    FMP_API_KEY = os.getenv('FMP_API_KEY').split(',') 
    for api_key in FMP_API_KEY:
        url = f'{FMP_API_URL}/profile/{symbol}?apikey={api_key}'
        response = requests.get(url)
        data = response.json()
        if 'Error Message' in data:
            continue
        return data
    return 'Failed to fetch data', 500


def get_sentiment_label(compound):
    if compound <= -0.4:
        return 'Bearish'
    elif compound <= -0.1:
        return 'Somewhat-Bearish'
    elif compound < 0.1:
        return 'Neutral'
    elif compound < 0.4:
        return 'Somewhat-Bullish'
    else:
        return 'Bullish'
        
def news_data(symbol, is_predict=False):
    # NEWS_API_URL = os.getenv('NEWS_API_URL')
    # NEWS_API_KEY = os.getenv('NEWS_API_KEY').split(',') 
    # yesterday = datetime.date.today() - datetime.timedelta(days=2)
    # string_yesterday = yesterday.strftime('%Y-%m-%d')
    # for api_key in NEWS_API_KEY:
    #     url = f'{NEWS_API_URL}/everything?q={symbol}&from={string_yesterday}&language=en&sortBy=popularity&apiKey={api_key}'
    #     response = requests.get(url)
    #     if (response.status_code != 200):
    #         continue
    #     data = response.json()
    #     articles = data.get('articles', [])
    #     filtered_articles = [{'title' :item['title'], 
    #                         'url': item['url'], 
    #                         'publishedAt': item['publishedAt'], 
    #                         'urlToImage': item['urlToImage'],
    #                         'description': item['description']
    #                         } for item in articles if item['title'] != '[Removed]' and item['urlToImage']]
    #     return filtered_articles
    # return 'Failed to fetch data', 500

    # AV_NEWS_API_URL = os.getenv('AV_NEWS_API_URL')
    # AV_NEWS_API_KEY = os.getenv('AV_NEWS_API_KEY').split(',')
    # for api_key, proxy in AV_NEWS_API_KEY):
    #     url = f'{AV_NEWS_API_URL}/query?function=NEWS_SENTIMENT&tickers={symbol}&apikey={api_key}'
    #     response = requests.get(url)
    #     if (response.status_code != 200):
    #         continue
    #     data = response.json()
    #     articles = data.get('feed', [])
    #     filtered_articles = []
    #     sentiment_scores = []
    #     sentiment_labels_count = {'Bearish': 0, 'Somewhat-Bearish': 0, 'Neutral': 0, 'Somewhat-Bullish': 0, 'Bullish': 0}
    #     relevance_scores = []
    #     for item in articles:
    #         sentiment_elem = next((val for val in item['ticker_sentiment'] if val["ticker"] == symbol), None)
    #         relevance = float(sentiment_elem['relevance_score']) 
    #         if relevance >= 0.1:
    #             filtered_articles.append({'title' :item['title'], 
    #                         'url': item['url'], 
    #                         'publishedAt': item['time_published'], 
    #                         'urlToImage': item['banner_image'],
    #                         'description': item['summary'],
    #                     })
    #             if is_predict:
    #                 relevance_scores.append(relevance)
    #                 sentiment_label = sentiment_elem['ticker_sentiment_label']
    #                 sentiment_labels_count[sentiment_label] += 1
    #                 sentiment_scores.append(float(sentiment_elem['ticker_sentiment_score']))
    #     if is_predict:
    #         relevance_scores = np.array(relevance_scores)
    #         sentiment_scores = np.array(sentiment_scores)
    #         sentiment_value = np.dot(relevance_scores, sentiment_scores) / np.sum(relevance_scores) 
    #         sentiment_info = {
    #             'sentiment_value': sentiment_value,
    #             'sentiment_labels_count': sentiment_labels_count
    #         }
    #         return {'articles': filtered_articles, 'sentiment_info': sentiment_info}
    #     return {'articles': filtered_articles}
    # return 'Failed to fetch data', 500

    analyzer = SentimentIntensityAnalyzer()
    url = f'https://api.tickertick.com/feed?q=z:{symbol}&n=200'
    response = requests.get(url)
    data = response.json()
    articles = data.get('stories', [])
    label_counts = {
        'Bearish': 0,
        'Somewhat-Bearish': 0,
        'Neutral': 0,
        'Somewhat-Bullish': 0,
        'Bullish': 0
    }
    filtered_articles = []
    sentiment_scores = []
    for item in articles:
        if 'title' not in item or 'url' not in item or 'time' not in item or 'favicon_url' not in item or 'description' not in item:
            continue
        filtered_articles.append({
            'title': item['title'],
            'url': item['url'],
            'publishedAt': item['time'],
            'urlToImage': item['favicon_url'],
            'description': item['description']
        })
        if is_predict:
            sentiment = analyzer.polarity_scores(item['description'])
            compound = sentiment['compound']
            sentiment_scores.append(compound)
            label = get_sentiment_label(compound)
            label_counts[label] += 1
    if is_predict:
        sentiment_scores = np.array(sentiment_scores)
        weights = np.linspace(1.0, 0.5, len(sentiment_scores)) if len(sentiment_scores) > 0 else np.array([])
        sentiment_value = np.average(sentiment_scores, weights=weights) if len(sentiment_scores) > 0 else 0
        sentiment_info = {
            'sentiment_value': sentiment_value,
            'sentiment_labels_count': label_counts
        }
        return {'articles': filtered_articles, 'sentiment_info': sentiment_info}
    return {'articles': filtered_articles}


def historical_price(symbol, option, ipo_date):
    TWELVE_DATA_API_URL = os.getenv('TWELVE_DATA_API_URL')
    TWELVE_DATA_API_KEYS = os.getenv('TWELVE_DATA_API_KEYS').split(',') 
    options = {
        '1d': {'interval': '1min', 'months': 0, 'days': 1},
        '5d': {'interval': '15min', 'months': 0, 'days': 7},
        '1m': {'interval': '1day', 'months': 1},
        '6m': {'interval': '1day', 'months': 6},
        'ytd': {'interval': '1day', 'start_date': f'{datetime.date.today().year}-01-01'},
        '1y': {'interval': '1day', 'months': 12},
        '5y': {'interval': '1week', 'months': 60},
        'max': {'interval': '1month', 'start_date': ipo_date}
    }
    end_date = datetime.date.today()
    user_option = options.get(option)
    interval = user_option.get('interval')
    if 'start_date' in user_option:
        start_date = user_option['start_date']
    else:
        months = user_option.get('months', 0)
        days = user_option.get('days', 0)
        start_date = end_date - relativedelta(months=months) - datetime.timedelta(days=days)
        if option == '1d':
            if start_date.weekday() == 5:
                start_date = start_date - datetime.timedelta(days=1)
            elif start_date.weekday() == 6:
                start_date = start_date - datetime.timedelta(days=2)
    
    for api_key in TWELVE_DATA_API_KEYS:
        url = f'{TWELVE_DATA_API_URL}/time_series?symbol={symbol}&interval={interval}&start_date={start_date}&apikey={api_key}'
        response = requests.get(url)
        data = response.json()
        if 'code' in data:
            continue
        data_values = data.get('values', [])
        return data_values
    return 'Failed to fetch data', 500


class ChatSession:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.chat_history = [
            {'role': 'assistant', 'content': INITIAL_MESSAGE}
        ]

    def get_response(self, user_message, user_data):
        client = OpenAI(
            base_url=os.getenv('LLAMA_API_URL'),
            api_key=os.getenv('LLAMA_API_KEY'),
        )
        personalized_prompt = self.system_prompt
        if user_data:
            personalized_prompt += f"\n\nCurrent User Data: {user_data}\n"

        self.chat_history.extend(user_message)
        messages = [{'role': 'system', 'content': personalized_prompt}] + self.chat_history
        payload = {
            'messages': messages,
            'model': 'meta-llama/llama-3.1-8b-instruct:free',
        }
        response = client.chat.completions.create(**payload)
        if response.choices:
            reply = response.choices[0].message.content
            self.chat_history.append({'role': 'assistant', 'content': reply})
            return reply
        else:
            return "Sorry, I couldn't generate a response. Please try again later."

    def get_chat_history(self):
        """Return the current chat history."""
        return self.chat_history

    def reset(self):
        """Reset the chat session."""
        self.__init__()


def predict(symbol, option):
    pass
