# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'VideoWork'
        db.create_table(u'ss_com_videowork', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('work', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['ss_com.Work'])),
            ('video_file', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('loop', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal(u'ss_com', ['VideoWork'])


    def backwards(self, orm):
        # Deleting model 'VideoWork'
        db.delete_table(u'ss_com_videowork')


    models = {
        u'ss_com.videowork': {
            'Meta': {'object_name': 'VideoWork'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'loop': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'video_file': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'work': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['ss_com.Work']"})
        },
        u'ss_com.work': {
            'Meta': {'object_name': 'Work'},
            'date_added': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'priority': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'slug': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'specs': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'thumb': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'work_type': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        }
    }

    complete_apps = ['ss_com']