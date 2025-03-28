import stripe
from django.conf import settings
from django.contrib.auth.models import Group, User
import os

STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
PRODUCT_ID = os.getenv('PRODUCT_ID')  
CLIENT_URL = os.getenv('CLIENT_URL', 'http://localhost:5173')

stripe.api_key = STRIPE_SECRET_KEY

def create_stripe_checkout_session(user_id):
    """
    Create a Stripe Checkout session using the existing Premium Upgrade price.
    Returns the session ID or an error message.
    """
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': PRODUCT_ID, 
                    'quantity': 1,
                },
            ],
            mode='payment',  
            success_url=f'{CLIENT_URL}/success?session_id={{CHECKOUT_SESSION_ID}}',  
            cancel_url=f'{CLIENT_URL}/faliure',
            metadata={
                'user_id': user_id  
            }
        )
        return checkout_session.id, None
    except Exception as e:
        return None, str(e)

def update_user_to_premium(user_id):
    """
    Update the user's group to 'Premium User' and remove them from the 'User' group.
    Returns a success message or an error message.
    """
    try:
        user = User.objects.get(id=user_id)
        user_group = Group.objects.get(name='User')
        user.groups.remove(user_group)
        premium_group = Group.objects.get(name='Premium User')
        user.groups.add(premium_group)
        return "Upgrade to premium successful", None
    except Exception as e:
        return None, str(e)


def verify_stripe_webhook(payload, sig_header):
    """
    Verify the Stripe webhook signature and return the event.
    Returns the event or an error message.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        return event, None
    except stripe.error.SignatureVerificationError as e:
        return None, str(e)