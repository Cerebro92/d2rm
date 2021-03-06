from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^category', views.category, name='category'),
    url(r'^sentiments/(?P<nature>.+$)', views.sentiments, name='sentiment')
]
