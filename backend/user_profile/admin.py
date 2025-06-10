from django.contrib import admin


from .models import (
    DreamerProfile,
    UserProfile,
    Country,
    City,
)

admin.site.register(Country)
admin.site.register(City)
admin.site.register(UserProfile)
admin.site.register(DreamerProfile)
