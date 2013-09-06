from django.db import models
import random, string


class NewsletterEmail(models.Model):
    email = models.EmailField(unique=True)
    rando = models.CharField(max_length=20, unique=True)
    date_entered = models.DateField(auto_now_add=True)

    def __unicode__(self):
    	return self.email

    @classmethod
    def create(cls, email):
    	
    	need_rando = True
    	while need_rando:
    		rando = ''.join(random.choice(string.ascii_lowercase) for x in range(16))
    		if (NewsletterEmail.objects.filter(rando=rando).count() == 0):
    			need_rando = False

    	return cls(
    		email=email,
    		rando=rando
    	)


class NewsletterSent(models.Model):
    text = models.TextField(editable=False)
    subject = models.CharField(max_length=100, editable=False)
    date_entered = models.DateField(auto_now_add=True, editable=False)
