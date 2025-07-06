from django.contrib import admin
from django.contrib.admin import ModelAdmin

from dreams.models import Category, Dream, Donation, Comment


# admin.site.register(Category)
# admin.site.register(Dream)
# admin.site.register(Donation)
# admin.site.register(Comment)


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    """Define Category model"""
    list_display = (
        "id",
        "name",
        "description",
        "is_verified",
    )
    search_fields = (
        "id",
        "name",
    )
    list_editable = ("is_verified", )


@admin.register(Comment)
class CommentAdmin(ModelAdmin):
    """Define Comment model"""
    list_display = (
        "id",
        "owner_id",
        "owner",
        "dream_id",
        "dream",
        "created_at",
        "content",
    )
    search_fields = (
        "owner__id",
        "owner__email",
        "dream__id",
    )


@admin.register(Donation)
class DonationAdmin(ModelAdmin):
    """Define Donation model"""
    list_display = (
        "id",
        "dream_id",
        "donator_id",
        "donator",
        "amount",
        "status",
        "is_anonymous",
        "date",
    )
    search_fields = (
        "dream__id",
        "donator__email",
        "dream__id",
        "status",
    )


@admin.register(Dream)
class DreamAdmin(ModelAdmin):
    """Define Dream model"""
    list_display = (
        "id",
        "owner_id",
        "owner",
        "to_another",
        "dreamer_id",
        "display_categories",
        "status",
        "goal",
        "created_at",
        "completed_at",
        "number_views",
        "has_photo",
    )
    search_fields = (
        "id",
        "owner__email",
        "dreamer__id",
    )

    def has_photo(self, obj):
      return bool(obj.photo_url)

    has_photo.boolean = True

    def display_categories(self, obj):
        return ", ".join([cat.name for cat in obj.categories.all()])

    display_categories.short_description = "categories"

