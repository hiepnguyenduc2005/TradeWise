from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Profile, Transaction

class UserAuthTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        self.profile = Profile.objects.get(user=self.user)
        self.profile.balance = 1500
        self.profile.save()
        self.index_url = reverse("index")
        self.login_url = reverse("login")  
        self.logout_url = reverse("logout") 
        self.signup_url = reverse("signup")
        self.changepw_url = reverse("changepw")
        self.addcash_url = reverse("addcash")
        self.showcash_url = reverse("showcash")
        self.quote_url = reverse("quote")
        self.profile_url = reverse("profile")
        self.graph_url = reverse("graph")
        self.buy_url = reverse("buy")
        self.sell_url = reverse("sell")
        self.history_url = reverse("history")

    def test_signup_success(self):
        response = self.client.post(self.signup_url, {
            "username": "newuser",
            "password": "newpassword",
            "cf_password": "newpassword",
            "email": "newuser@gmail.com",
            "first_name": "new",
            "last_name": "user",
            "balance": "500"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json().get("message"), "Signup successful")
    
    def test_signup_failure(self):
        response = self.client.post(self.signup_url, {
            "username": "testuser",
            "password": "testpassword",
            "cf_password": "testpassword",
            "email": "testuser@gmail.com",
            "first_name": "test",
            "last_name": "user",
            "balance": "300"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("error"), "Username already exists")

    def test_login_success(self):
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpassword"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Login successful")

    def test_login_failure(self):
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "wrongpassword"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("error"), "Invalid credentials")

    def test_logout(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Logout successful")

    def test_change_password_success(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.changepw_url, {
            "old_password": "testpassword",
            "new_password": "newpassword",
            "cf_new_password": "newpassword"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Password successfully changed")

    def test_change_password_failure(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.changepw_url, {
            "old_password": "wrongpassword",
            "new_password": "newpassword",
            "cf_new_password": "newpassword"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("error"), "Invalid credentials")
    
    def test_add_cash(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.addcash_url, {
            "amount": "500"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Cash successfully added")
    
    def test_show_cash(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.showcash_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("balance"), 1500)

    def test_index_logined(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.index_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Welcome to Tradewise! You have no stocks yet.")
    
    def test_index_not_logined(self):
        response = self.client.get(self.index_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Welcome to Tradewise!")

    def test_quote(self):
        response = self.client.post(self.quote_url, {
            "symbol": "AAPL"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("symbol"), "AAPL")
    
    def test_profile(self):
        response = self.client.post(self.profile_url, {
            "symbol": "AAPL"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("company").get("symbol"), "AAPL")

    def test_graph(self):
        response = self.client.post(self.graph_url, {
            "symbol": "AAPL", "ipoDate": "1980-12-12"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("meta").get("symbol"), "AAPL")
    
    def test_buy(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.post(self.buy_url, {
            "symbol": "AAPL",
            "quantity": "1"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Stock bought successfully")
        response_history = self.client.get(self.history_url)
        self.assertEqual(response_history.status_code, 200)
        self.assertEqual(response_history.json()[0].get("symbol"), "AAPL")
    
    def test_sell(self):
        self.client.login(username="testuser", password="testpassword")
        self.client.post(reverse("buy"), {
            "symbol": "AAPL",
            "quantity": "2"
        }, content_type="application/json")
        response = self.client.post(self.sell_url, {
            "symbol": "AAPL",
            "quantity": "1"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Stock sold successfully")
        response_history = self.client.get(self.history_url)
        self.assertEqual(response_history.status_code, 200)
        self.assertEqual(response_history.json()[0].get("symbol"), "AAPL")

