from django.conf.urls import patterns, url

from newsletter import views


urlpatterns = patterns('',
	url(r'^signup/$', views.signup, name='signup'),
	url(r'^unsubscribe/(?P<rando>\w+)/$', views.unsubscribe, name='unsubscribe'),
	url(r'^write/$', views.write, name='write'),
)