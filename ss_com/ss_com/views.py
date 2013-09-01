from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse
from django.core.context_processors import csrf

from bs4 import BeautifulSoup

from models import Work, NoWork
import models
import datetime, json, requests


def jsonResponse(success, response={}):
    
    if (success is False):
        if ('error' not in response):
            response['error'] = 'General error.'
        response['success'] = False
    else:
        response['success'] = True

    return HttpResponse(json.dumps(response), mimetype='application/json')


def home(request):
    ago = datetime.date.today() - datetime.timedelta(days=182)
    
    return render(
        request,
        'ss_com/index.html',
        {
            'all_work': Work.objects.all(),
            'nowork': NoWork.get_nowork(),
            'need_url_check': (NoWork.objects.filter(nowork_type=models.NOWORK_TYPE_LINK,date_checked__lt=ago).count() > 0)
        }
    )


def check_urls(request):
    ago = datetime.date.today() - datetime.timedelta(days=182)
    noworks = NoWork.objects.filter(nowork_type=models.NOWORK_TYPE_LINK,date_checked__lt=ago)
    for nowork in noworks:
        nowork.date_checked = datetime.date.today()
        r = requests.get(nowork.url)
        if (r.status_code == 200):
            nowork.active = True
            soup = BeautifulSoup(r.text)
            if (soup.title):
                nowork.title = soup.title.string

            description = soup.findAll(attrs={"name":"description"})
            if description and description[0].has_attr('content'):
                nowork.text = description[0]['content']
        else:
            nowork.active = False

        nowork.save()


    return jsonResponse(True)


@csrf_protect
def get_work(request):
    work = Work.objects.all();