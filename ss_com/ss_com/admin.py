from django.contrib import admin
from models import Work, VideoWork, NoWork, Bio, BioPic

admin.site.register([NoWork])
admin.site.register([Work, VideoWork])
admin.site.register([Bio, BioPic])
