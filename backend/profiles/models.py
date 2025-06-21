from django.contrib.auth import get_user_model
from django.db import models


class Country(models.Model):
    name = models.CharField(max_length=63, unique=True)

    class Meta:
        db_table = "users_country"  # old table
        verbose_name_plural = "countries"
        ordering = ["name"]

    def __str__(self) -> str:
        return str(self.name)


class City(models.Model):
    name = models.CharField(max_length=63)
    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name="cities"
    )

    class Meta:
        db_table = "users_city"  # old table
        verbose_name_plural = "cities"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "country"],
                name="unique_city_country",
            )
        ]

    def __str__(self) -> str:
        return str(self.name)


class UserProfile(models.Model):
    user = models.OneToOneField(
        get_user_model(), on_delete=models.CASCADE, related_name="userprofile"
    )
    name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
    )
    phone_number = models.CharField(max_length=30, blank=True, null=True, unique=True)
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    direction = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_collective = models.BooleanField(default=False)
    avatar_url = models.URLField(null=True, blank=True)  # save in Storage
    thumbnail_url = models.URLField(null=True, blank=True)  # miniature

    class Meta:
        db_table = "users_userprofile"  # old table
        ordering = ["-created_at"]

    def __str__(self) -> str:
        name = self.name if self.name else "No Name"
        city = self.city.name if self.city else "No City"
        phone = self.phone_number if self.phone_number else "No Phone"
        return f"{name} ({city}) - {phone}"


class DreamerProfile(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True, unique=True)
    phone_number = models.CharField(max_length=30, unique=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    direction = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    is_collective = models.BooleanField(default=False)

    class Meta:
        db_table = "users_dreamerprofile"  # old table
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.city.name}) - {self.phone_number}"


class OtherCountry(models.Model):
    name = models.CharField(max_length=63, unique=True)
    code = models.CharField(max_length=2, unique=True)

    def __str__(self):
        return f"{self.name} / {self.code}"

    class Meta:
        verbose_name_plural = "other countries"
        ordering = ["name"]
