from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse
from django.core.validators import email_re
from django.template.loader import get_template
from django.template import Context
from django.conf import settings

from models import NewsletterEmail

import json
import sendgrid, html2text


def jsonResponse(success, response={}):
    
    if (success is False):
        if ('error' not in response):
            response['error'] = 'General error.'
        response['success'] = False
    else:
        response['success'] = True

    return HttpResponse(json.dumps(response), mimetype='application/json')


def send_email(type, *args, **kwargs):
    
    message_body = ''
    if (type == 'signup'):
        message_body = get_template('newsletter/email/signup.html').render(
            Context({
                'rando': kwargs['rando']
            })
        )
        subject = 'Stave says: Thanks!'
        emails = [kwargs['email']]

    elif (type == 'newsletter'):
        if (settings.ENVIRONMENT == 'production'):
            emails = NewsletterEmail.objects.values_list('email', flat=True)
        else:
            emails = ["banfangled@yahoo.ca"]

    s = sendgrid.Sendgrid(settings.SENDGRID['username'], settings.SENDGRID['password'], secure=True)
    if (message_body != ''):
        message = sendgrid.Message("steve@steveshaddick.com", subject,  html2text.html2text(message_body), message_body)
        message.add_to(emails)

        s.smtp.send(message)
        #s.web.send(message)



@csrf_protect
def signup(request):
    if ('email' in request.POST):
        email = request.POST['email']
        if email_re.match(email):
            if (NewsletterEmail.objects.filter(email=email).count() > 0):
                return jsonResponse(True)
            else:
                newsletter_email = NewsletterEmail.create(email)
                newsletter_email.save()
                send_email('signup', rando=newsletter_email.rando, email=email)
                return jsonResponse(True)

    return jsonResponse(False)