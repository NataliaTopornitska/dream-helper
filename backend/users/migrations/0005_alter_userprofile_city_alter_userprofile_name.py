# Generated by Django 5.2 on 2025-04-10 17:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_alter_userprofile_user"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userprofile",
            name="city",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="users.city",
            ),
        ),
        migrations.AlterField(
            model_name="userprofile",
            name="name",
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
    ]
