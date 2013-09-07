from django.contrib import admin
from models import Work, VideoWork, WebWork, NoWork, SiteText, BioPic

admin.site.register([NoWork])
admin.site.register([Work, VideoWork, WebWork])
admin.site.register([SiteText, BioPic])
