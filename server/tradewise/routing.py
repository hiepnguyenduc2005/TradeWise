from django.urls import re_path
from . import consumers  

websocket_urlpatterns = [
    re_path(r'ws/stock/(?P<id>\d+)/(?P<symbol>\w+)/$', consumers.StockConsumer.as_asgi()),
    re_path(r'ws/user/(?P<user_id>\w+)/$', consumers.UserProfileConsumer.as_asgi()),
    re_path(r'ws/historical/(?P<id>\d+)/(?P<symbol>\w+)/$', consumers.HistoricalPriceConsumer.as_asgi())
]
