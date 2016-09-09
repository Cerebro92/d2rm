# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('link', models.CharField(max_length=200)),
                ('feedback', models.CharField(max_length=10000)),
                ('source', models.CharField(max_length=50)),
                ('category', models.CharField(max_length=20)),
                ('sentiment', models.CharField(max_length=20)),
                ('date', models.DateTimeField(verbose_name=b'date published')),
                ('client', models.ForeignKey(to='client.Client')),
            ],
        ),
    ]
