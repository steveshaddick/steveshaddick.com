from django.db import models

WORK_TYPES = (
    ('video', 'Video'),
    ('website', 'Website'),
    ('audio', 'Audio')
)

class Work(models.Model):
    title = models.CharField(max_length=255)
    slug = models.CharField(max_length=100, unique=True)
    work_type = models.CharField(max_length=20, choices=WORK_TYPES)
    priority = models.SmallIntegerField(default=0)
    thumb = models.ImageField(upload_to='thumbs')
    specs = models.CharField(max_length=255, blank=True)
    info = models.TextField(blank=True)
    date_added = models.DateTimeField()

    class Meta:
        verbose_name_plural = "Works"

    def __unicode__(self):
        return self.title


class VideoWork(models.Model):
    work = models.ForeignKey(Work)
    video_file = models.CharField(max_length=255)
    loop = models.BooleanField(default=False)

    def __unicode__(self):
        return self.work.title