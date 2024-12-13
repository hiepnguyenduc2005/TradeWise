from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Profile, Transaction
from .templates import view_message, view_error, view_profile, view_transaction
from .helpers import login_required, require_POST, stock_data, company_profile, news_data, historical_price, ChatSession

chat_sessions = {}


# authentication
def session(request):
    if not request.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})
    username = request.user.username
    fullname = request.user.first_name + ' ' + request.user.last_name
    return JsonResponse({'isAuthenticated': True, 'username': username, 'fullname': fullname})


# index 
@csrf_exempt
def index(request):
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
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
                data.append({'symbol': symbol, 'shares': shares, 'price': stock_data(symbol)[1]})
        if not data:
            return view_message('Welcome to Tradewise! You have no stocks yet.')
        return JsonResponse(data, safe=False)
    return view_message('Welcome to Tradewise!')


# temp_transactions
@login_required
@csrf_exempt
def temp(request):
    profile = Profile.objects.get(user=request.user)
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
        if not username or not password:
            return view_error('Username and password are required')
        if User.objects.filter(username=username).exists():
            return view_error('Username already exists')
        user = User.objects.create_user(username=username, password=password, email=email,
                                        first_name=first_name, last_name=last_name)
        user.save()
        user = authenticate(request, username=username, password=password)
        login(request, user)
        profile = Profile.objects.get(user=user)
        profile.balance = 0
        profile.balance += float(balance)
        profile.save()
        transaction = Transaction(user=profile, symbol='Cash', shares=1, price=balance)
        transaction.save()
        profile.save()
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
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            profile = Profile.objects.get(user=user)
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
        profile = Profile.objects.get(user=request.user)
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
        profile = Profile.objects.get(user=request.user)
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
        return JsonResponse({'symbol': stock_symbol, 'price': stock_price, 'change': stock_change, 
                             'percent_change': stock_percent_change, 'is_market_open': stock_market_open})
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# company profile
@csrf_exempt
def profile(request):
    try:
        if request.method == 'GET':
            symbol = request.GET.get('symbol')
        else:
            data = json.loads(request.body)
            symbol = data.get('symbol')
        if not symbol:
            return view_error('Symbol is required')
        data_company = company_profile(symbol)
        if not data_company:
            return view_error('Error fetching company profile: Invalid symbol')
        company = data_company[0]
        company_name = company['companyName']
        news = news_data(company_name)
        return JsonResponse({'company': company, 'news': news})
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
        data_stock = historical_price(symbol, option, ipo_date)
        return JsonResponse(data_stock, safe=False)
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
        profile = Profile.objects.get(user=request.user)
        if profile.balance < total_price:
            return view_error('Insufficient balance')
        transaction = Transaction(user=profile, symbol=stock_symbol, shares=quantity, price=stock_price)
        transaction.save()
        profile.balance -= total_price
        profile.save()
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
        profile = Profile.objects.get(user=request.user)
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
        return view_transaction(transaction, 'Stock sold successfully')
    except json.JSONDecodeError:
        return view_error('Invalid JSON')


# history
@login_required
@csrf_exempt
def history(request):
    try:
        profile = Profile.objects.get(user=request.user)
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
