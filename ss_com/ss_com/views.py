from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.http import HttpResponse
from django.core.context_processors import csrf
from django.core.exceptions import ObjectDoesNotExist

from bs4 import BeautifulSoup

from models import Work, NoWork, SiteText, BioPic
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


@ensure_csrf_cookie
def home(request):
    ago = datetime.date.today() - datetime.timedelta(days=182)

    all_work = Work.objects.filter(active=True).order_by('-date_added')
    return render(
        request,
        'ss_com/index.html',
        {
            'all_work': all_work,
            'nowork': NoWork.get_nowork(),
            'need_url_check': (NoWork.objects.filter(nowork_type=models.NOWORK_TYPE_LINK,date_checked__lt=ago).count() > 0),
            'bio': SiteText.objects.get(slug='bio'),
            'bio_pic': BioPic.get_random()
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
def get_work(request, slug):
    try:
        work = Work.objects.get(slug=slug, active=True)
    except ObjectDoesNotExist:
        response = {
            'id': '4O4',
            'type': '404',
            'text': SiteText.objects.get(slug='404').text,
            'randomWork': Work.objects.filter(active=True).order_by('?')[0].slug
        }
        return jsonResponse(False, response)

    full_work = work.get_extended()
    if (full_work is not None):
        response = {
            'id': work.id,
            'type': work.work_type,
            'title': work.title,
            'image': work.image.url if work.image else '',
            'specs': work.specs,
            'info': work.info
        }
        if (work.work_type == models.WORK_TYPE_VIDEO):
            response['loop'] = full_work.loop,
            response['videoFile'] = full_work.video_file
            response['allowScrub'] = full_work.allow_scrub
            response['hasAudio'] = full_work.has_audio
        elif (work.work_type == models.WORK_TYPE_WEBSITE):
            response['url'] = full_work.url

        return jsonResponse(True, response)
    else:
        response = {
            'id': '4O4',
            'type': '404',
            'text': SiteText.objects.get(slug='404').text,
            'randomWork': Work.objects.filter(active=True).order_by('?')[0].slug
        }
        return jsonResponse(False, response)