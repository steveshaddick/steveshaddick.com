from django.contrib import admin
from models import Work, VideoWork, NoWork

admin.site.register([NoWork])
admin.site.register([Work, VideoWork])
