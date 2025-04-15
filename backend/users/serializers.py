import os

from django.contrib.auth import get_user_model
from rest_framework import serializers

from app import settings
from app.settings import DOMAIN, API_PREF
from rest_framework.fields import ImageField

from users.models import (
    ActivationToken,
    DreamerProfile,
    Country,
    City,
    UserProfile,
    Subscriber,
)
from utils.email import send_email_with_template


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "email", "password", "is_staff", "is_active")
        read_only_fields = (
            "is_staff",
            "is_active",
        )
        extra_kwargs = {
            "password": {
                "write_only": True,
                "min_length": 5,
                "style": {"input_type": "password"},
            }
        }

    def create(self, validated_data):
        """Create a new user with encrypted password, generate activation token, and send email"""
        user = get_user_model().objects.create_user(**validated_data)

        # Generate Token for Activation and user activation link
        activation_token = ActivationToken(user=user)
        activation_token.save()
        activation_link = (
            f"{DOMAIN}/{API_PREF}/users/activate/{user.id}/{activation_token.token}"
        )

        # Send email with activation token
        context = {
            "user": user.email,
            "activation_link": activation_link,
        }

        send_email_with_template(
            subject="🎉 Welcome to DreamHelper! Activate Your Account",
            template_name=os.path.join(
                settings.BASE_DIR,
                "templates",
                "email",
                "activate_account_email.html",
            ),
            context=context,
            recipient_email=user.email,
        )
        # create empty UserProfile
        UserProfile.objects.create(user=user)

        return user

    def update(self, instance, validated_data):
        """Update a user, set the password correctly and return it"""
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "email", "is_staff", "is_active")
        read_only_fields = (
            "id",
            "is_staff",
            "is_active",
        )

    def update(self, instance, validated_data):
        """Update a user"""
        return super().update(instance, validated_data)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            "id",
            "name",
        )


class CitySerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(write_only=True)  # country_name for writing
    country = CountrySerializer(read_only=True)  # for look at

    class Meta:
        model = City
        fields = ("id", "name", "country_name", "country")

    def create(self, validated_data):
        print(f"from CitySerializer: {validated_data=}")
        country_name = validated_data.pop("country_name")
        country, _ = Country.objects.get_or_create(name=country_name)
        validated_data["country"] = country
        print(f"from CitySerializer: {validated_data["country"]=}")
        return City.objects.create(**validated_data)


class DreamerProfileCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    direction = serializers.CharField(required=False, allow_blank=True)

    email = serializers.EmailField(required=False)
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), required=False
    )
    other_country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), required=False
    )
    other_city = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = DreamerProfile
        fields = (
            "name",
            "email",
            "phone_number",
            "country",
            "other_country",
            "city",
            "other_city",
            "direction",
            "is_collective",
            "created_at",
        )

    def validate_dreamer(self, value):
        to_another = self.initial_data.get("to_another", True)
        if not to_another:
            return None  # if to_another=False, ignore dreamer
        return value

    def create(self, validated_data):
        other_country_name = validated_data.pop("other_country", "").strip()
        other_city_name = validated_data.pop("other_city", "").strip()
        selected_country = validated_data.pop("country", None)
        selected_city = validated_data.pop("city", None)

        # Get or create country
        if other_country_name:
            country, _ = Country.objects.get_or_create(name=other_country_name)
        elif selected_country:
            country = selected_country
        else:
            raise serializers.ValidationError(
                "Please select a country or enter your own."
            )

        # Get or create city
        if other_city_name:
            city, _ = City.objects.get_or_create(name=other_city_name, country=country)
        elif selected_city:
            city = selected_city
        else:
            raise serializers.ValidationError("Please select a city or enter your own.")

        validated_data["city"] = city

        return DreamerProfile.objects.create(**validated_data)


class UserProfileCreateSerializer(serializers.ModelSerializer):
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), required=False, allow_null=True, default=None
    )
    other_country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), required=False, allow_null=True, default=None
    )
    other_city = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = (
            "name",
            "phone_number",
            "country",
            "other_country",
            "city",
            "other_city",
            "direction",
            "is_collective",
            "created_at",
        )

    def create(self, validated_data):
        other_country_name = validated_data.pop("other_country", "").strip()
        other_city_name = validated_data.pop("other_city", "").strip()
        selected_country = validated_data.pop("country", None)
        selected_city = validated_data.pop("city", None)

        # Get or create country
        if other_country_name:
            country, _ = Country.objects.get_or_create(name=other_country_name)
        elif selected_country:
            country = selected_country
        else:
            raise serializers.ValidationError(
                "Please select a country or enter your own."
            )

        # Get or create city
        if other_city_name:
            city, _ = City.objects.get_or_create(name=other_city_name, country=country)
        elif selected_city:
            city = selected_city
        else:
            raise serializers.ValidationError("Please select a city or enter your own.")

        validated_data["city"] = city

        return UserProfile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update a user's Profile,"""
        other_country = validated_data.pop("other_country", "")
        if other_country:
            country, _ = Country.objects.get_or_create(name=other_country)
            validated_data["country"] = country
        other_city = validated_data.pop("other_city", "")
        if other_city:
            city, _ = City.objects.get_or_create(
                name=other_city, country=validated_data["country"]
            )
            validated_data["city"] = city

        name = validated_data.pop("name", "")
        profile = super().update(instance, validated_data)
        if name:
            profile.name = name
            profile.save(update_fields=["name"])

        return profile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "user",
            "name",
            "phone_number",
            "city",
            "direction",
            "is_collective",
            "created_at",
            "avatar_url",
            "thumbnail_url",
        )


class UserProfileAvatarSerializer(serializers.ModelSerializer):
    photo_avatar = ImageField()

    class Meta:
        model = UserProfile
        fields = ("id", "photo_avatar")


class SubscriberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)

    class Meta:
        model = Subscriber
        fields = ("id", "email", "is_active")


class SubscriberCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subscriber
        fields = (
            "id",
            "email",
        )


class DreamerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DreamerProfile
        fields = (
            "id",
            "name",
            "email",
            "phone_number",
            "city",
            "direction",
            "is_collective",
            "created_at",
        )


class DreamerProfileCreateSerializer(serializers.ModelSerializer):
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), required=False, allow_null=True, default=None
    )
    other_country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), required=False, allow_null=True, default=None
    )
    other_city = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    direction = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = DreamerProfile
        fields = (
            "name",
            "email",
            "phone_number",
            "country",
            "other_country",
            "city",
            "other_city",
            "direction",
            "is_collective",
            "created_at",
        )

    def create(self, validated_data):
        other_country_name = validated_data.pop("other_country", "").strip()
        other_city_name = validated_data.pop("other_city", "").strip()
        selected_country = validated_data.pop("country", None)
        selected_city = validated_data.pop("city", None)

        # Get or create country
        if other_country_name:
            country, _ = Country.objects.get_or_create(name=other_country_name)
        elif selected_country:
            country = selected_country
        else:
            raise serializers.ValidationError(
                "Please select a country or enter your own."
            )

        # Get or create city
        if other_city_name:
            city, _ = City.objects.get_or_create(name=other_city_name, country=country)
        elif selected_city:
            city = selected_city
        else:
            raise serializers.ValidationError("Please select a city or enter your own.")

        validated_data["city"] = city

        return DreamerProfile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update a dreamer's Profile,"""
        other_country = validated_data.pop("other_country", "")
        if other_country:
            country, _ = Country.objects.get_or_create(name=other_country)
            validated_data["country"] = country
        other_city = validated_data.pop("other_city", "")
        if other_city:
            city, _ = City.objects.get_or_create(
                name=other_city, country=validated_data["country"]
            )
            validated_data["city"] = city

        name = validated_data.pop("name", "")
        dreamer_profile = super().update(instance, validated_data)
        if name:
            dreamer_profile.name = name
            dreamer_profile.save(update_fields=["name"])

        return dreamer_profile
