# Generated by Django 5.2 on 2025-04-12 16:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("dreams", "0005_remove_dream_photo_dream_photo_url_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name="dream",
            name="comments",
        ),
        migrations.RemoveField(
            model_name="dream",
            name="donations",
        ),
        migrations.AlterField(
            model_name="comment",
            name="dream",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="comments",
                to="dreams.dream",
            ),
        ),
        migrations.AlterField(
            model_name="donation",
            name="donator",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="donations",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="donation",
            name="dream",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="donations",
                to="dreams.dream",
            ),
        ),
        migrations.AddIndex(
            model_name="donation",
            index=models.Index(fields=["dream"], name="dreams_dona_dream_i_b3d459_idx"),
        ),
    ]
