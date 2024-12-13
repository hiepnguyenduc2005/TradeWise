from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('session', views.session, name='session'),
    path('temp', views.temp, name='temp'),
    path('login', views.login_user, name='login'),
    path('logout', views.logout_user, name='logout'),
    path('signup', views.signup_user, name='signup'),
    path('changepw', views.change_password, name='changepw'),
    path('addcash', views.add_cash, name='addcash'),
    path('showcash', views.show_cash, name='showcash'),
    path('quote', views.quote, name='quote'),
    path('profile', views.profile, name='profile'),
    path('graph', views.stock_graph, name='graph'),
    path('buy', views.buy, name='buy'),
    path('sell', views.sell, name='sell'),
    path('history', views.history, name='history'),
    path('session', views.session, name='session'),
    path('chatbot', views.chatbot, name='chatbot'),
    path('chathistory', views.chat_history, name='chathistory'),
    path('reset', views.chatbot_reset, name='reset'),
]