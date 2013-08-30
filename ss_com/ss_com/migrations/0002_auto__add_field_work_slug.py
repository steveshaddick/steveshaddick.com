# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Work.slug'
        db.add_column(u'ss_com_work', 'slug',
                      self.gf('django.db.models.fields.CharField')(default='', unique=True, max_length=100),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Work.slug'
        db.delete_column(u'ss_com_work', 'slug')


    models = {
        u'ss_com.work': {
            'Meta': {'object_name': 'Work'},
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