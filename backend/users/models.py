import uuid

from django.contrib.auth.models import (
    AbstractUser,
    BaseUserManager,
)
from django.db import models
from django.utils.translation import gettext as _


class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if extra_fields.get("is_active") is not True:
            raise ValueError("Superuser must have is_active=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(_("email address"), unique=True)
    is_owner = models.BooleanField(_("is owner"), default=False)
    is_donator = models.BooleanField(_("is donator"), default=False)
    is_active = models.BooleanField(_("is active"), default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()


class ActivationToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class Country(models.Model):
    name = models.CharField(max_length=63, unique=True)

    class Meta:
        verbose_name_plural = "countries"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class City(models.Model):
    name = models.CharField(max_length=63)
    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name="cities"
    )

    class Meta:
        verbose_name_plural = "cities"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="userprofile"
    )
    name = models.CharField(
        max_length=150,
        blank=True,
        null=True,
    )
    phone_number = models.CharField(max_length=30, blank=True, null=True, unique=True)
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    direction = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_collective = models.BooleanField(default=False)
    avatar = models.URLField(null=True, blank=True)  # save in Storage

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.city.name}) - {self.phone_number}"


class DreamerProfile(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True, unique=True)
    phone_number = models.CharField(max_length=30, unique=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    direction = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)
    is_collective = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.city.name}) - {self.phone_number}"


class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email
