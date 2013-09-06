# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'NewsletterSent.subject'
        db.add_column(u'newsletter_newslettersent', 'subject',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'NewsletterSent.subject'
        db.delete_column(u'newsletter_newslettersent', 'subject')


    models = {
        u'newsletter.newsletteremail': {
            'Meta': {'object_name': 'NewsletterEmail'},
            'date_entered': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'unique': 'True', 'max_length': '75'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rando': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '20'})
        },
        u'newsletter.newslettersent': {
            'Meta': {'object_name': 'NewsletterSent'},
            'date_entered': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'subject': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'text': ('django.db.models.fields.TextField', [], {})
        }
    }

    complete_apps = ['newsletter']