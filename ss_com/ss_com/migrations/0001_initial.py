# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Work'
        db.create_table(u'ss_com_work', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('work_type', self.gf('django.db.models.fields.CharField')(max_length=20)),
            ('priority', self.gf('django.db.models.fields.SmallIntegerField')(default=0)),
            ('thumb', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
            ('specs', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('info', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'ss_com', ['Work'])


    def backwards(self, orm):
        # Deleting model 'Work'
        db.delete_table(u'ss_com_work')


    models = {
        u'ss_com.work': {
            'Meta': {'object_name': 'Work'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'priority': ('django.db.models.fields.SmallIntegerField', [], {'default': '0'}),
            'specs': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'thumb': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'work_type': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        }
    }

    complete_apps = ['ss_com']