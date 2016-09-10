from django.db.models import Count
from django.shortcuts import render

from .models import Review
import json

def index(request):
    total_count = Review.objects.count()
    pos_count = Review.objects.filter(sentiment__iexact='positive').count()
    neg_count = Review.objects.filter(sentiment__iexact='negative').count()
    return render(request, 'index.html',
        {'total_count': total_count, 'pos_count': pos_count, 'neg_count': neg_count})

def category(request):
    results = Review.objects.values('source').\
        annotate(dcount=Count('source'))
    data = {}
    for result in results:
        data[result['source']] = result['dcount']
    return render(request, 'category.html', {'results': json.dumps(data)})

def sentiments(request, nature):
    filter_dict = {}
    if nature == 'negative':
        filter_dict['sentiment__iexact'] = 'negative'
    elif nature == 'positive':
        filter_dict['sentiment__iexact'] = 'positive'
    reviews = Review.objects.filter(**filter_dict)
    return render(request, 'sentiments.html', {'reviews': list(reviews)})
