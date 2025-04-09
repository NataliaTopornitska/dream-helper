from django.contrib import admin

from dreams.models import Category, Dream, Donation, Comment


admin.site.register(Category)
admin.site.register(Dream)
admin.site.register(Donation)
admin.site.register(Comment)
