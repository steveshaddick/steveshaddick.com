from django.db import models
import sorl.thumbnail

import datetime, random

WORK_TYPE_VIDEO = 'video'
WORK_TYPE_WEBSITE = 'website'
WORK_TYPE_AUDIO = 'video'
WORK_TYPES = (
    (WORK_TYPE_VIDEO, 'Video'),
    (WORK_TYPE_WEBSITE, 'Website'),
    (WORK_TYPE_AUDIO, 'Audio')
)

NOWORK_TYPE_LINK = 'link'
NOWORK_TYPE_QUOTE = 'quote'
NOWORK_TYPE_IMAGE = 'image'
NOWORK_TYPE_NEWWORK = 'newwork'
NOWORK_TYPES = (
    (NOWORK_TYPE_LINK, 'Link'),
    (NOWORK_TYPE_QUOTE, 'Quote'),
    (NOWORK_TYPE_IMAGE, 'Image'),
    (NOWORK_TYPE_NEWWORK, 'New Work')
)

class SiteText(models.Model):
    slug = models.SlugField()
    text = models.TextField()

    def __unicode__(self):
        return self.slug


class BioPic(models.Model):
    title = models.CharField(max_length=100, blank=True)
    image = sorl.thumbnail.ImageField(upload_to='images')

    def __unicode__(self):
        return self.image.url

    @staticmethod
    def get_random():
        rnd = random.randrange(0, BioPic.objects.all().count())
        return BioPic.objects.all()[rnd]


class Work(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField()
    work_type = models.CharField(max_length=20, choices=WORK_TYPES)
    priority = models.SmallIntegerField(default=0)
    thumb = models.ImageField(upload_to='thumbs')
    image = models.ImageField(upload_to='images', blank=True)
    specs = models.CharField(max_length=255, blank=True)
    info = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    date_added = models.DateField()

    class Meta:
        ordering = ['title']

    def __unicode__(self):
        return self.title

    def get_extended(self):
        if (self.work_type == WORK_TYPE_VIDEO):
            extended_work = self.videowork_set.all()
        elif (self.work_type == WORK_TYPE_WEBSITE):
            extended_work = self.webwork_set.all()

        if ((extended_work is not None) and (extended_work.count() > 0)):
            return extended_work[0]
        else:
            return None

    def get_url(self):
        if (self.work_type == WORK_TYPE_WEBSITE):
            return self.webwork_set.all()[0].url
        else:
            return '/#/' + self.slug


class VideoWork(models.Model):
    work = models.ForeignKey(Work)
    video_file = models.CharField(max_length=255)
    loop = models.BooleanField(default=False)
    has_audio = models.BooleanField(default=False)
    allow_scrub = models.BooleanField(default=True)

    class Meta:
        ordering = ['work__title']

    def __unicode__(self):
        return self.work.title


class WebWork(models.Model):
    work = models.ForeignKey(Work)
    url = models.URLField()

    class Meta:
        ordering = ['work__title']

    def __unicode__(self):
        return self.work.title


class NoWork(models.Model):
    title = models.CharField(max_length=255)
    nowork_type = models.CharField(max_length=20, choices=NOWORK_TYPES)
    url = models.URLField(blank=True)
    image = sorl.thumbnail.ImageField(upload_to='images', blank=True)
    text = models.TextField(blank=True)
    date_shown = models.DateField(blank=True, null=True)
    active = models.BooleanField(default=True)
    date_checked = models.DateField(default='1900-01-01')

    def __unicode__(self):
        return self.nowork_type + ': ' + self.title

    @classmethod
    def create(cls, params):
        nowork = cls(
            title=params['title'],
            nowork_type=params['type'],
            url=params['url'],
            image=params['image'],
            text=params['text'],
        )
        return nowork

    @staticmethod
    def get_nowork():

        try: 
            nowork = NoWork.objects.get(date_shown=datetime.date.today(), active=True)
            return nowork
        
        except NoWork.DoesNotExist:

            #maybe show new work
            if (random.randrange(0,3) == 0):
                work = Work.objects.order_by('date_added')[0]
                NoWork.objects.filter(nowork_type=NOWORK_TYPE_NEWWORK).delete()

                nowork = NoWork.create({
                    'title': work.title,
                    'type': NOWORK_TYPE_NEWWORK,
                    'url': work.get_url(),
                    'image': work.image,
                    'text': work.specs
                })
            else:
                noworks = NoWork.objects.filter(active=True).exclude(nowork_type=NOWORK_TYPE_NEWWORK).order_by('date_shown')
                for nowork in noworks:
                    if (random.randrange(0,4) == 0):
                        break

            nowork.date_shown = datetime.date.today()
            nowork.save()

            return nowork


