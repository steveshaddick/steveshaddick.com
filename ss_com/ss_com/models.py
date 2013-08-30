from django.db import models

WORK_TYPES = (
    ('video', 'Video'),
    ('website', 'Website'),
    ('audio', 'Audio')
)

class Work(models.Model):
    title = models.CharField(max_length=255)
    work_type = models.CharField(max_length=20, choices=WORK_TYPES)
    priority = models.SmallIntegerField(default=0)
    thumb = models.ImageField(upload_to='thumbs')
    specs = models.CharField(max_length=255, blank=True)
    info = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Works"

    def __unicode__(self):
        return self.title