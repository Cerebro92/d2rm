from django.db import models
from client.models import Client

class Review(models.Model):
    link = models.CharField(max_length=200)
    client = models.ForeignKey(Client)
    feedback = models.CharField(max_length=10000)
    source = models.CharField(max_length=50)
    category = models.CharField(max_length=20)
    sentiment = models.CharField(max_length=20)
    date = models.DateTimeField('date published')

    def __str__(self):
        return self.link +"-"+ self.source +"-"+ str(self.client)
