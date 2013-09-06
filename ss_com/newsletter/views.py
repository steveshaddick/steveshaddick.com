from django.shortcuts import render, render_to_response
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.core.validators import email_re
from django.template.loader import get_template
from django.template import Context, RequestContext 
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

from models import NewsletterEmail
from forms import WriteForm

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
        subject = 'Steve says: Thanks!'
        emails = [kwargs['email']]

    elif (type == 'newsletter'):
        message_body = get_template('newsletter/email/newsletter.html').render( Context({'text': kwargs['text']}) )
        subject = kwargs['subject']

        message_body.replace('<h1>', '<h1 style="font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:16px;color:#333">')
        message_body.replace('<p>', '<p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#7d7d7d; margin-top:10px;">')

        if (settings.ENVIRONMENT == 'production'):
            if kwargs['type'] == 'real':
                all_emails = NewsletterEmail.objects.values_list('email', flat=True)
            else:
                all_emails = ["banfangled@yahoo.ca"]
        else:
            all_emails = ["banfangled@yahoo.ca"]

        emails = {}
        for email in all_emails:
            emails[email] = {"%unsub_num%": NewsletterEmail.objects.get(email=email).rando }

    s = sendgrid.Sendgrid(settings.SENDGRID['username'], settings.SENDGRID['password'], secure=True)
    if (message_body != ''):
        message = sendgrid.Message("steve@steveshaddick.com", subject,  html2text.html2text(message_body), message_body)
        message.add_to(emails)

        s.smtp.send(message)
        #s.web.send(message)


def unsubscribe(request, rando):
    
    error = False
    email = ''
    try:
        newsletter_email = NewsletterEmail.objects.get(rando=rando)
    except ObjectDoesNotExist:
        error = True

    if not error:
        email = newsletter_email.email
        newsletter_email.delete()

    return render_to_response('newsletter/unsubscribe.html', {'error': error, 'email': email}, context_instance=RequestContext(request))


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


@login_required
def write(request):
    if request.method == 'POST':
        form = WriteForm(request.POST)
        print request.POST['text']
        send_email('newsletter', text=request.POST['text'], subject=request.POST['subject'])
        return jsonResponse(True, {'response': 'Sent!'})

                
    else:
        form = WriteForm()

    return render(request, 'newsletter/write.html', {
        'form': form
    })