from django.http import JsonResponse

def view_message(message, status = 200):
    return JsonResponse({'message': message}, status=status)


def view_error(error, status = 400):
    return JsonResponse({'error': error}, status=status)


def view_profile(profile, message, status = 200):
    return JsonResponse({
                    'message': message,
                    'username': profile.user.username,
                    'fullname': profile.user.first_name + ' ' + profile.user.last_name,
    }, status=status)

def view_transaction(transaction, message):
    return JsonResponse({
                    'message': message,
                    'symbol': transaction.symbol,
                    'shares': transaction.shares,
                    'price': transaction.price,
    })