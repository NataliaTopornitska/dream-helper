from django.contrib import admin
from django.contrib.admin import ModelAdmin

from .models import (
    DreamerProfile,
    UserProfile,
    Country,
    City,
    OtherCountry,
)

# admin.site.register(Country)
# admin.site.register(City)
# admin.site.register(UserProfile)
# admin.site.register(DreamerProfile)
# admin.site.register(OtherCountry)


@admin.register(Country)
class CountryAdmin(ModelAdmin):
    """Define Country model"""
    list_display = (
        "id",
        "name",
    )
    search_fields = (
        "name",
    )


@admin.register(City)
class CityAdmin(ModelAdmin):
    """Define City model"""
    list_display = (
        "id",
        "name",
        "country",
    )
    search_fields = (
        "name",
    )


@admin.register(OtherCountry)
class OtherCountryAdmin(ModelAdmin):
    """Define OtherCountry model"""
    list_display = (
        "id",
        "name",
        "code",
    )
    search_fields = (
        "name",
    )


@admin.register(UserProfile)
class UserProfileAdmin(ModelAdmin):
    """Define UserProfile model"""
    list_display = (
        "id",
        "user_id",
        "user",
        "name",
        "city",
        "phone_number",
        "is_collective",
        "created_at",
        "direction",
        "has_avatar",
    )
    search_fields = (
        "user__email",
        "name",
        "city__name",
    )

    def has_avatar(self, obj):
      return bool(obj.avatar_url)

    has_avatar.boolean = True


@admin.register(DreamerProfile)
class DreamerProfileAdmin(ModelAdmin):
    """Define DreamerProfile model"""
    list_display = (
        "id",
        "email",
        "name",
        "city",
        "phone_number",
        "is_collective",
        "created_at",
        "direction",
    )
    search_fields = (
        "email",
        "name",
        "city__name",
    )

