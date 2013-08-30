from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect

from models import Work

def home(request):

    return render(
        request,
        'ss_com/index.html',
        {
            'all_work': Work.objects.all()
        }
    )

@csrf_protect
def get_work(request):
	work = Work.objects().all();