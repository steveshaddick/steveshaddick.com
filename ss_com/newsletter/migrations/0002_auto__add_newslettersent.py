# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'NewsletterSent'
        db.create_table(u'newsletter_newslettersent', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('text', self.gf('django.db.models.fields.TextField')()),
            ('date_entered', self.gf('django.db.models.fields.DateField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'newsletter', ['NewsletterSent'])


    def backwards(self, orm):
        # Deleting model 'NewsletterSent'
        db.delete_table(u'newsletter_newslettersent')


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
            'text': ('django.db.models.fields.TextField', [], {})
        }
    }

    complete_apps = ['newsletter']