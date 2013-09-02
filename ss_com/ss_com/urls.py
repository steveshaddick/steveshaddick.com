from django.conf.urls import patterns, include, url

from ss_com import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	url(r'^$', views.home, name='home'),
	url(r'^check-urls/$', views.check_urls, name='check_url'),
	url(r'^work/(?P<slug>\w+)/$', views.get_work, name='get_work'),
    # Examples:
    # url(r'^$', 'ss_com.views.home', name='home'),
    # url(r'^ss_com/', include('ss_com.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
