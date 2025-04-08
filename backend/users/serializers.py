import os

from django.contrib.auth import get_user_model
from rest_framework import serializers

from app import settings
from app.settings import DOMAIN, API_PREF
from users.models import ActivationToken
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
