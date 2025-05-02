from celery import shared_task
from .helpers import stock_data, historical_price
from django.core.cache import cache
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

@shared_task
def update_stock_quote(id, symbol):
    data_stock = stock_data(symbol, checking_profile=True)
    # print(f"[CELERY] update_stock_quote for {symbol}: {data_stock}")
    if 'error' not in data_stock:
        stock_market_open = data_stock['is_market_open']
        cache_key = f"stock_quote_{symbol}"
        cache.set(cache_key, data_stock, timeout=300 if stock_market_open else 3600)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"stock_{id}_{symbol}",
            {"type": "quote_update", "data": data_stock}
        )
        return f"{symbol} updated"
    return f"{symbol} failed"

@shared_task
def update_user_profile(user_id, shortlist):
    data = []
    for symbol, shares in shortlist.items():
        if shares > 0 and symbol != 'Cash':
            price = stock_data(symbol)['price']
            if price is not None:
                data.append({'symbol': symbol, 'shares': shares, 'price': price})
    # print(f"[CELERY] update_user_profile for {user_id}: {data}")
    cache_key = f"user_profile_{user_id}"
    cache.set(cache_key, json.dumps(data), timeout=300)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {"type": "user_profile_update", "data": data}
    )
    return f"User {user_id} profile updated"

@shared_task
def update_stock_historical(id, symbol):
    data = historical_price(symbol, '1d', '2000-01-01')
    # print(f"[CELERY] update_stock_historical for {symbol}: {data}")
    if 'error' not in data:
        cache_key = f"historical_price_{symbol}_1d"
        cache.set(cache_key, data, timeout=900)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"stock_{id}_{symbol}",
            {"type": "historical_price_update", "data": data}
        )
        return f"{symbol} historical data updated"
    return f"{symbol} historical data failed"


        
            