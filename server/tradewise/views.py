from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.contrib.auth.models import Group
import json
from .models import Profile, Transaction
from .templates import view_message, view_error, view_profile, view_transaction
from .helpers import login_required, require_POST, stock_data, company_profile, news_data, historical_price, ChatSession
from .predict import predict_stock
from .stripe import create_stripe_checkout_session, update_user_to_premium, verify_stripe_webhook

chat_sessions = {}


# authentication
def session(request):
    in_user = request.user
    if not in_user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})
    username = in_user.username
    fullname = in_user.first_name + ' ' + in_user.last_name
    group = in_user.groups.all()[0].name
    if not group:
        group = 'User'
    elif group == 'Expert':
        expert = Profile.objects.get(user=in_user)
        if not expert.approved_expert :
            group = 'Pending Expert' 
    return JsonResponse({'isAuthenticated': True, 'username': username, 'fullname': fullname, 'group': group})


# index 
@csrf_exempt
def index(request):
    in_user = request.user
    if in_user.is_authenticated:
        cache_key = f"user_profile_{in_user.id}"
        cached_data = cache.get(cache_key)
        
        if cached_data: 
            try:
                cached_data = json.loads(cached_data)
                return JsonResponse(cached_data, safe=False)
            except json.JSONDecodeError:
                view_error("Error decoding cached data")
        
        profile = Profile.objects.get(user=in_user)
        transaction = Transaction.objects.filter(user=profile)
        shortlist = dict()

        for t in transaction:
            if t.symbol in shortlist:
                shortlist[t.symbol] += t.shares
            else:
                shortlist[t.symbol] = t.shares

        data = []
        for symbol, shares in shortlist.items():
            if shares > 0 and symbol != 'Cash':
                price = stock_data(symbol)[1]  
                if price is not None:
                    data.append({'symbol': symbol, 'shares': shares, 'price': price})
        cache.set(cache_key, json.dumps(data), timeout=300)
        if not data:
            return view_message('Welcome to Tradewise! You have no stocks yet.')
        return JsonResponse(data, safe=False)
    
    return view_message('Welcome to Tradewise!')


# temp_transactions
@login_required
@csrf_exempt
def temp(request):
    in_user = request.user
    profile = Profile.objects.get(user=in_user)
    transaction = Transaction.objects.filter(user=profile)
    shortlist = dict()
    for t in transaction:
        if t.symbol in shortlist:
            shortlist[t.symbol] += t.shares
        else:
            shortlist[t.symbol] = t.shares
    data = []
    for symbol, shares in shortlist.items():
        if shares > 0 and symbol != 'Cash':
            data.append({'symbol': symbol, 'shares': shares})
    if not data:
        return view_message('You have no stocks yet.')
    return JsonResponse(data, safe=False)


# signup 
@require_POST
@csrf_exempt
def signup_user(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        balance = float(data.get('balance')) 
        is_expert = data.get('is_expert', False)
        if not username or not password:
            return view_error('Username and password are required')
        if User.objects.filter(username=username).exists():
            return view_error('Username already exists')
        user = User.objects.create_user(username=username, password=password, email=email,
                                        first_name=first_name, last_name=last_name)
        user.save()
        if is_expert:
            user_group = Group.objects.get(name='Expert')
        else:
            user_group = Group.objects.get(name='User')
        user.groups.add(user_group)
        in_user = authenticate(request, username=username, password=password)
        login(request, in_user)
        profile = Profile.objects.get(user=in_user, balance=float(balance))
        profile.save()
        if is_expert:
            profile.approved_expert = False
            profile.save()
        else:
            transaction = Transaction(user=profile, symbol='Cash', shares=1, price=balance)
            transaction.save()
        return view_profile(profile, 'Signup successful', 201)
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# login 
@require_POST
@csrf_exempt
def login_user(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        in_user = authenticate(request, username=username, password=password)
        if in_user is not None:
            login(request, in_user)
            profile = Profile.objects.get(user=in_user)
            return view_profile(profile, 'Login successful')
        else:
            return view_error('Invalid credentials')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')  


# logout 
@login_required
@require_POST
@csrf_exempt
def logout_user(request):
    user_id = request.user.id 
    if user_id in chat_sessions:
        del chat_sessions[user_id]
    logout(request)
    return view_message('Logout successful')
    

# change password 
@login_required
@require_POST
@csrf_exempt
def change_password(request):
    try:
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        user = authenticate(request, username=request.user.username, password=old_password)
        if user is not None:
            user.set_password(new_password)
            user.save()
            return view_message('Password successfully changed')
        else:
            return view_error('Invalid credentials')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')
    

# upgrade to premium
@login_required
@require_POST
@csrf_exempt
def upgrade_premium(request):
    try:
        user_id = request.user.id
        session_id, error = create_stripe_checkout_session(user_id)
        if error:
            return view_error(f"Failed to create checkout session: {error}")
        return JsonResponse({'sessionId': session_id})
    except Exception as e:
        return view_error(f"Error initiating payment: {str(e)}")

# stripe webhook
@csrf_exempt
def stripe_webhook(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event, error = verify_stripe_webhook(payload, sig_header)
    if error:
        return view_error({'error': f"Webhook verification failed: {error}"})
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']   
        message, error = update_user_to_premium(user_id)
        if error:
            view_error({'error': f"Failed to update user: {error}"}, status=400)
        return view_message(f'Status: Success, Successfully upgraded to premium: {message}')
    return view_message('Status: Ignore', 200)

# add cash
@login_required
@require_POST
@csrf_exempt
def add_cash(request):
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        if not amount:
            return view_error('Amount is required')
        in_user = request.user
        profile = Profile.objects.get(user=in_user)
        profile.balance += float(amount)
        profile.save()
        transaction = Transaction(user=profile, symbol='Cash', shares=1, price=amount)
        transaction.save()
        return view_profile(profile, 'Cash successfully added')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# show cash
@login_required
@csrf_exempt
def show_cash(request):
    try:
        in_user = request.user
        profile = Profile.objects.get(user=in_user)
        return JsonResponse({'balance': profile.balance})
    except Profile.DoesNotExist:
        return view_error('Profile not found')


# quote
@csrf_exempt
def quote(request):
    try:
        if request.method == 'GET':
            symbol = request.GET.get('symbol')
        else:
            data = json.loads(request.body)
            symbol = data.get('symbol')
        if not symbol:
            return view_error('Symbol is required')
        cache_key = f"stock_quote_{symbol}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return JsonResponse(cached_data)
        data_stock = stock_data(symbol, checking_profile=True)
        if isinstance(data_stock[1], int):
            return view_error(data_stock[0], data_stock[1])
        stock_symbol = data_stock[0]
        stock_price = data_stock[1]
        stock_change = data_stock[2]
        stock_percent_change = data_stock[3]
        stock_market_open = data_stock[4]
        stock_price = round(float(stock_price), 2)
        stock_change = round(float(stock_change), 3)
        stock_percent_change = round(float(stock_percent_change), 3)
        stock_info = {'symbol': stock_symbol, 'price': stock_price, 'change': stock_change, 
                             'percent_change': stock_percent_change, 'is_market_open': stock_market_open}
        if stock_market_open:
            cache.set(cache_key, stock_info, timeout=300)
        else:
            cache.set(cache_key, stock_info, timeout=3600)
        return JsonResponse(stock_info)
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# company profile
@csrf_exempt
def profile(request):
    try:
        if request.method == 'GET':
            symbol = request.GET.get('symbol')
            is_predict = request.GET.get('isPredict', False)
        else:
            data = json.loads(request.body)
            symbol = data.get('symbol')
            is_predict = data.get('isPredict', False)
        if not symbol:
            return view_error('Symbol is required')
        cache_key_profile = f"company_profile_{symbol}"
        cached_data_profile = cache.get(cache_key_profile)
        if not cached_data_profile:
            data_company = company_profile(symbol)
            if not data_company:
                return view_error('Error fetching company profile: Invalid symbol')
            company = data_company[0]
            cache.set(cache_key_profile, {'company': company}, timeout=86400)
        else:
            company = cached_data_profile.get('company')
        
        if is_predict:
            cache_key_news = f"company_news_predict_{symbol}"
            cached_data_news = cache.get(cache_key_news)
            if not cached_data_news:
                news_info = news_data(symbol, is_predict=True)
                cache.set(cache_key_news, news_info, timeout=3600)
                news = news_info['articles']
                sentiment = news_info['sentiment_info']
            else:
                news = cached_data_news['articles']
                sentiment = cached_data_news['sentiment_info']
            company_info = {'company': company, 'news': news, 'sentiment': sentiment}
        else:
            cache_key_news = f"company_news_{symbol}"
            cached_data_news = cache.get(cache_key_news)
            if not cached_data_news:
                news_info = news_data(symbol)
                cache.set(cache_key_news, news_info, timeout=3600)
                news = news_info['articles']
            else:
                news = cached_data_news['articles']
            company_info = {'company': company, 'news': news}
        return JsonResponse(company_info)
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# historical price
@csrf_exempt
def stock_graph(request):
    try:
        if request.method == 'GET':
            symbol = request.GET.get('symbol')
            option = request.GET.get('option', '1d')
            ipo_date = request.GET.get('ipoDate', '2000-01-01')
        else:
            data = json.loads(request.body)
            symbol = data.get('symbol')
            option = data.get('option', '1d')
            ipo_date = data.get('ipoDate', '2000-01-01')
        if not symbol:
            return view_error('Symbol is required')
        cache_key = f"historical_price_{symbol}_{option}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return JsonResponse(cached_data, safe=False)
        data_stock = historical_price(symbol, option, ipo_date)
        if option == '1d':
            cache.set(cache_key, data_stock, timeout=900)  
        elif option == '5d':
            cache.set(cache_key, data_stock, timeout=3600)
        else:
            cache.set(cache_key, data_stock, timeout=86400)  
        return JsonResponse(data_stock, safe=False)
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# predict stock
@login_required
@require_POST
@csrf_exempt
def predict(request):
    try:
        data = json.loads(request.body)
        symbol = data.get('symbol')
        show_option = data.get('show_option', '1m')
        predict_option = data.get('predict_option', '5d')
        if not symbol:
            return view_error('Symbol is required')
        
        show_data_key = f"historical_price_{symbol}_{show_option}"
        show_data = cache.get(show_data_key)
        if show_data:
            show_data = show_data
        else:
            show_data = historical_price(symbol, show_option, ipo_date='2000-01-01')
            cache.set(show_data_key, show_data, timeout=86400)
        
        predict_data_key = f"predicted_price_{symbol}_{predict_option}"
        predict_data = cache.get(predict_data_key)
        if predict_data:
            predict_data = predict_data
            return JsonResponse({'showData': show_data, 'predictData': predict_data}, safe=False)
        
        train_data_key = f"historical_price_{symbol}_1y"
        train_data = cache.get(train_data_key)
        if train_data:
            train_data = train_data
        else:
            train_data = historical_price(symbol, '1y', ipo_date='2000-01-01')
            cache.set(train_data_key, train_data, timeout=86400)
        
        predict_data = predict_stock(train_data, predict_option)
        predict_data.insert(0, {'datetime': show_data[0]['datetime'], 'close': show_data[0]['close']})
        cache.set(predict_data_key, predict_data, timeout=86400)
        return JsonResponse({'showData': show_data, 'predictData': predict_data}, safe=False)
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# buy
@login_required
@require_POST
@csrf_exempt
def buy(request):
    try:
        data = json.loads(request.body)
        symbol = data.get('symbol')
        quantity = data.get('quantity')
        if not symbol or not quantity:
            return view_error('Symbol and quantity are required')
        data_stock = stock_data(symbol)
        if isinstance(data_stock[1], int):
            return view_error(data_stock[0], data_stock[1])
        stock_symbol, stock_price = data_stock
        total_price = float(stock_price) * int(quantity)
        in_user = request.user
        profile = Profile.objects.get(user=in_user)
        if profile.balance < total_price:
            return view_error('Insufficient balance')
        transaction = Transaction(user=profile, symbol=stock_symbol, shares=quantity, price=stock_price)
        transaction.save()
        profile.balance -= total_price
        profile.save()
        cache_key = f"user_profile_{profile.user.id}"
        cache.delete(cache_key)
        return view_transaction(transaction, 'Stock bought successfully')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')
    

# sell  
@login_required
@require_POST
@csrf_exempt
def sell(request):
    try:
        data = json.loads(request.body)
        symbol = data.get('symbol')
        quantity = data.get('quantity')
        if not symbol or not quantity:
            return view_error('Symbol and quantity are required')
        data_stock = stock_data(symbol)
        if isinstance(data_stock[1], int):
            return view_error(data_stock[0], data_stock[1])
        stock_symbol, stock_price = data_stock
        total_price = float(stock_price) * int(quantity)
        in_user = request.user
        profile = Profile.objects.get(user=in_user)
        transactions = Transaction.objects.filter(user=profile, symbol=stock_symbol)
        if not transactions:
            return view_error('No stocks to sell')
        total_shares = sum([t.shares for t in transactions])
        if total_shares < int(quantity):
            return view_error('Insufficient shares')
        transaction = Transaction.objects.create(user=profile, symbol=stock_symbol, shares=-int(quantity), price=stock_price)
        transaction.save()
        profile.balance += total_price
        profile.save()
        cache_key = f"user_profile_{profile.user.id}"
        cache.delete(cache_key)
        return view_transaction(transaction, 'Stock sold successfully')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# history
@login_required
@csrf_exempt
def history(request):
    try:
        in_user = request.user
        profile = Profile.objects.get(user=in_user)
        transactions = Transaction.objects.filter(user=profile)
        data = [{'symbol': t.symbol, 'shares': t.shares, 'price': t.price, 'time': t.time} for t in transactions]
        return JsonResponse(data, safe=False)
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# chatbot
@login_required
@require_POST
@csrf_exempt
def chatbot(request):
    try:
        user_id = request.user.id 
        if user_id not in chat_sessions:
            chat_sessions[user_id] = ChatSession()
        body = json.loads(request.body)
        user_message = body.get('messages', [])
        user_data = body.get('data', {})
        session = chat_sessions[user_id]
        reply = session.get_response(user_message, user_data)
        return JsonResponse({'reply': reply})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# chat history
@login_required
@csrf_exempt
def chat_history(request):
    """Fetch the chat history for the current user."""
    try:
        user_id = request.user.id
        session = chat_sessions.get(user_id, ChatSession())
        return JsonResponse({'chat_history': session.get_chat_history()})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

# chatbot reset
@login_required
@require_POST
@csrf_exempt
def chatbot_reset(request):
    try:
        user_id = request.user.id 
        if user_id in chat_sessions:
            del chat_sessions[user_id]
        return view_message('Chat successfully reset')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')
