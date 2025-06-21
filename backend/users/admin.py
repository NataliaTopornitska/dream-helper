from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext as _

from .models import (
    User,
    ActivationToken,
    Subscriber,
)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Define admin model for custom User model with no email field."""

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )
    list_display = (
        "email",
        "is_staff",
        "is_owner",
        "is_donator",
        "is_active"
    )
    search_fields = ("email",)
    ordering = ("email",)
    list_editable = ("is_active",)


# admin.site.register(ActivationToken)

# admin.site.register(Country)
# admin.site.register(City)
# admin.site.register(UserProfile)
# admin.site.register(DreamerProfile)
# admin.site.register(Subscriber)


@admin.register(ActivationToken)
class ActivationTokenAdmin(ModelAdmin):
    """Define ActivationToken model"""
    list_display = (
        "id",
        "token",
        "user",
        "created_at",
    )
    search_fields = (
        "user__email",
        "created_at",
    )


@admin.register(Subscriber)
class SubscriberAdmin(ModelAdmin):
    """Define Subscriber model"""
    list_display = (
        "id",
        "email",
        "is_active",
    )
    search_fields = (
        "email",
    )
    list_editable = ("is_active", )
