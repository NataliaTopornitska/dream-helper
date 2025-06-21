from django.contrib import admin


from .models import (
    DreamerProfile,
    UserProfile,
    Country,
    City,
    OtherCountry,
)

admin.site.register(Country)
admin.site.register(City)
admin.site.register(UserProfile)
admin.site.register(DreamerProfile)
admin.site.register(OtherCountry)
