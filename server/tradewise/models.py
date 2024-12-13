from django.db import models
from django.contrib.auth.models import User
import uuid

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)  
    balance = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.username}, {self.balance}"


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)  
    price = models.FloatField(default=0.0)
    shares = models.IntegerField(default=0)
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.user.username}, {self.symbol}, {self.shares}, {self.time.date()}"