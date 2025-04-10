import os

from django.contrib.auth import get_user_model
from rest_framework import serializers

from app import settings
from app.settings import DOMAIN, API_PREF

from users.models import ActivationToken, DreamerProfile, Country, City
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
            subject="Activate Your Account",
            template_name=os.path.join(
                settings.BASE_DIR,
                "templates",
                "email",
                "activate_account_email.html",
            ),
            context=context,
            recipient_email=user.email,
        )
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
    country_name = serializers.CharField(
        write_only=True
    )  # country_name for writing
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
