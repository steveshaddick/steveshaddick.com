from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect
from bs4 import BeautifulSoup

from models import Work, NoWork
import models
import datetime

def home(request):

    return render(
        request,
        'ss_com/index.html',
        {
            'all_work': Work.objects.all(),
            'nowork': NoWork.get_nowork(),
            'need_url_check': True
        }
    )

def check_urls(request):
	last_year = datetime.date.today() - datetime.timedelta(years=1)
	noworks = NoWork.objects.filter(nowork_type=models.NOWORK_TYPE_LINK,date_checked__lt=last_year)
	for nowork in noworks:
		soup = BeautifulSoup(open(nowork.url))
		print soup('title')[0].string


@csrf_protect
def get_work(request):
	work = Work.objects.all();