from django.contrib import admin
from models import Work, VideoWork, WebWork, NoWork, Bio, BioPic

admin.site.register([NoWork])
admin.site.register([Work, VideoWork, WebWork])
admin.site.register([Bio, BioPic])
