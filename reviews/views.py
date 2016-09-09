from django.db.models import Count
from django.shortcuts import render

from .models import Review
import json

def index(request):
    return render(request, 'index.html', {})

def category(request):
    results = Review.objects.values('source').\
        annotate(dcount=Count('source'))
    data = {}
    for result in results:
        data[result['source']] = result['dcount']
    return render(request, 'category.html', {'results': json.dumps(data)})
