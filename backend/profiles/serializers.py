from django.db.models import Sum, Subquery
from rest_framework import serializers

from app import settings
from app.settings import DOMAIN, API_PREF
from rest_framework.fields import ImageField

from profiles.models import (
    DreamerProfile,
    Country,
    City,
    UserProfile,
    OtherCountry,
)
from dreams.models import Dream, Donation
from utils.email import send_email_with_template

from .validators import (
  validate_city_country_pair,
  validate_profile_city_country_validated_data,
)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = (
            "id",
            "name",
        )


class OtherCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = OtherCountry
        fields = (
            "id",
            "name",
            "code",
        )


# class CityUpdateSerializer(serializers.ModelSerializer):
#     country = serializers.PrimaryKeyRelatedField(queryset=Country.objects.all())
#
#     class Meta:
#         model = City
#         fields = ("id", "name", "country")


class CityCreateSerializer(serializers.ModelSerializer):
    country = serializers.PrimaryKeyRelatedField(queryset=Country.objects.all(), allow_null=True, required=False)
    other_country = serializers.PrimaryKeyRelatedField(
        queryset=OtherCountry.objects.exclude(name__in=Subquery(Country.objects.values("name"))),
        allow_null=True,
        required=False
    )

    class Meta:
        model = City
        fields = ("id", "country",  "other_country", "name")


    def validate(self, data):
        city_name = data.get("name").strip().title()
        country = data.get("other_country") if data.get("other_country") else data.get("country")

        del data["other_country"]
        if city_name and country:
            country = validate_city_country_pair(city_name, country=country)
            new_country, _ = Country.objects.get_or_create(name=country.name)
            data["country"] = new_country
        data["name"] = city_name
        return data


class CitySerializer(serializers.ModelSerializer):
    # other_country = serializers.PrimaryKeyRelatedField(
    #     queryset=OtherCountry.objects.all()
    # )
    country = CountrySerializer(read_only=True)  # for look at

    class Meta:
        model = City
        fields = (
            "id",
            "name",
            # "other_country",
            "country",
        )

    # def create(self, validated_data):
    # print(f"from CitySerializer: {validated_data=}")
    # country_name = validated_data.pop("country_name")
    # country, _ = Country.objects.get_or_create(name=country_name)
    # validated_data["country"] = country
    # print(f"from CitySerializer: {validated_data['country']=}")
    # return City.objects.create(**validated_data)


class DreamerProfileCreateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    direction = serializers.CharField(required=False, allow_blank=True)

    email = serializers.EmailField(required=False)
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), required=False
    )
    other_country = serializers.PrimaryKeyRelatedField(
        queryset=OtherCountry.objects.all(),
        required=False,
        allow_null=True,
        default=None,
    )
    city = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(), required=False,
        allow_null=True,
        default=None,
    )
    other_city = serializers.CharField(
        required=False,
        allow_blank=True,
    )

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

        validate_profile_city_country_validated_data(validated_data)
        # other_country = validated_data.pop("other_country", None)
        # other_city_name = validated_data.pop("other_city", "").strip()
        # selected_country = validated_data.pop("country", None)
        # selected_city = validated_data.pop("city", None)
        #
        # # Get or create country
        # if other_country:
        #     country = other_country
        # elif selected_country:
        #     country = selected_country
        # else:
        #     raise serializers.ValidationError(
        #         "Please select a country or enter your own."
        #     )
        #
        # # Get or create city
        # if other_city_name:
        #     city, _ = City.objects.get_or_create(name=other_city_name, country=country)
        # elif selected_city:
        #     city = selected_city
        # else:
        #     raise serializers.ValidationError("Please select a city or enter your own.")
        #
        # validated_data["city"] = city

        return DreamerProfile.objects.create(**validated_data)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), required=False, allow_null=True, default=None
    )
    other_country = serializers.PrimaryKeyRelatedField(
        queryset=OtherCountry.objects.all(),
        required=False,
        allow_null=True,
        default=None,
    )
    city = serializers.PrimaryKeyRelatedField(
        queryset=City.objects.all(),
        required=False, allow_null=True, default=None
    )
    # other_city = CityCreateSerializer()
    other_city = serializers.CharField(
        required=False, allow_blank=True,
    )

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

    # def validate_city(self, value):
    #     return validate_city_format(value)
    #
    # def validate(self, data):
    #     city = data.get("city")
    #     country = data.get("country")
    #     if city and country:
    #         validate_city_country_pair(city, country)
    #     return data

    def create(self, validated_data):
        validate_profile_city_country_validated_data(validated_data)
        # other_country = validated_data.pop("other_country", None)
        # other_city_name = validated_data.pop("other_city", "").strip()
        # selected_country = validated_data.pop("country", None)
        # selected_city = validated_data.pop("city", None)
        #
        # # Get or create country
        # if other_country:
        #   country = other_country
        # elif selected_country:
        #   country = selected_country
        # else:
        #   raise serializers.ValidationError(
        #     "Please select a country or enter your own."
        #   )
        #
        # # Get or create city
        # if other_city_name:
        #   new_country, _ = Country.objects.get_or_create(name=country.name)
        #   country = validate_city_country_pair(other_city_name, country=new_country)
        #
        #   city, _ = City.objects.get_or_create(name=other_city_name, country=country)
        #
        # elif selected_city:
        #   city = selected_city
        # else:
        #   raise serializers.ValidationError("Please select a city or enter your own.")
        #
        # validated_data["city"] = city
        return UserProfile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update a user's Profile,"""
        other_country = validated_data.pop("other_country", None)
        if other_country:
            country, _ = Country.objects.get_or_create(name=other_country.name)
            validated_data["country"] = country

        other_city = validated_data.pop("other_city", None)

        if other_city:
            country = validate_city_country_pair(other_city, country=validated_data["country"])
            city, _ = City.objects.get_or_create(
                name=other_city, country=country
            )
            validated_data["city"] = city

        name = validated_data.pop("name", "")
        profile = super().update(instance, validated_data)
        if name:
            profile.name = name
            profile.save(update_fields=["name"])

        return profile


class UserProfileSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    email = serializers.ReadOnlyField(source="user.email")
    name = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            "user",
            "name",
            "email",
            "location",
            "phone_number",
            "direction",
            "is_collective",
            "created_at",
            "avatar_url",
            "city",
            "country",
        )

    def get_name(self, obj) -> str:
        user = obj.user
        name = getattr(obj, "name", None) if obj else None
        return name if name else user.email

    def get_country(self, obj) -> int:
        if obj.city:
            return obj.city.country.id

    def get_location(self, obj) -> str:
        if obj.city:
            return f"{obj.city.name}, {obj.city.country.name}"
        return "not specified"


class DreamDonatorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "user",
            "name",
            "thumbnail_url",
        )


class UserProfileAvatarSerializer(serializers.ModelSerializer):
    photo_avatar = ImageField()

    class Meta:
        model = UserProfile
        fields = ("id", "photo_avatar")


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


class UserMyDreamsSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.URLField(read_only=True)
    total_amount_donations = serializers.SerializerMethodField()  # total amount
    dreamer = serializers.SerializerMethodField()

    class Meta:
        model = Dream
        fields = [
            "id",
            "title",
            "to_another",
            "dreamer",
            "content",
            "goal",
            "thumbnail_url",
            "status",
            "created_at",
            "total_amount_donations",
            "number_views",
            "completed_at",
        ]

    def get_total_amount_donations(self, obj) -> float:
        return (
            obj.donations.filter(status="Paid").aggregate(total=Sum("amount"))["total"]
            or 0
        )

    def get_dreamer(self, obj) -> str:
        return (
            obj.dreamer.name if obj.dreamer and hasattr(obj.dreamer, "name") else None
        )


class UserMyDonationsSerializer(UserMyDreamsSerializer):
    user_amount = serializers.SerializerMethodField()

    class Meta(UserMyDreamsSerializer.Meta):
        fields = UserMyDreamsSerializer.Meta.fields + ["user_amount"]

    def get_user_amount(self, obj) -> float:
        user = self.context.get("request").user
        donations = Donation.objects.values("amount").filter(donator=user, dream=obj)
        return sum(item["amount"] for item in donations)


class UserPreparedDonationsSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = (
            "id",
            "date",
            "amount",
            "dream",
            "title",
            "url_payment",
            "is_anonymous",
            "status",
        )

    def get_title(self, obj) -> str:
        return obj.dream.title
