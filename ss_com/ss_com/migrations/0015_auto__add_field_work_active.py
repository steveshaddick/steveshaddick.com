# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Work.active'
        db.add_column(u'ss_com_work', 'active',
                      self.gf('django.db.models.fields.BooleanField')(default=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Work.active'
        db.delete_column(u'ss_com_work', 'active')


    models = {
        u'ss_com.bio': {
            'Meta': {'object_name': 'Bio'},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {})
        },
        u'ss_com.biopic': {
            'Meta': {'object_name': 'BioPic'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('sorl.thumbnail.fields.ImageField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'blank': 'True'})
        },
        u'ss_com.nowork': {
            'Meta': {'object_name': 'NoWork'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'date_checked': ('django.db.models.fields.DateField', [], {'default': "'1900-01-01'"}),
            'date_shown': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('sorl.thumbnail.fields.ImageField', [], {'max_length': '100', 'blank': 'True'}),
            'nowork_type': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        },
        u'ss_com.videowork': {
            'Meta': {'object_name': 'VideoWork'},
            'allow_scrub': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'has_audio': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'loop': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'video_file': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'work': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['ss_com.Work']"})
        },
        u'ss_com.webwork': {
            'Meta': {'object_name': 'WebWork'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'work': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['ss_com.Work']"})
        },
        u'ss_com.work': {
            'Meta': {'object_name': 'Work'},
            'active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'date_added': ('django.db.models.fields.DateField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'blank': 'True'}),
            'info': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'priority': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50'}),
            'specs': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'thumb': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'work_type': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        }
    }

    complete_apps = ['ss_com']