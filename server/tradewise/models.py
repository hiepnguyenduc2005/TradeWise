from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
import uuid

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)  
    balance = models.FloatField(default=0.0)
    approved_expert = models.BooleanField(default=True)

    def __str__(self):
        if self.user.groups.filter(name='Expert').exists():
            if not self.approved_expert:
                return f"{self.user.username}, {self.balance}, Pending Expert"
        return f"{self.user.username}, {self.balance}, {self.user.groups.all()[0]}"

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)  
    price = models.FloatField(default=0.0)
    shares = models.IntegerField(default=0)
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.user.username}, {self.symbol}, {self.shares}, {self.time.date()}"