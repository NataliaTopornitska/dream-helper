import requests
import re

from rest_framework import serializers

from app import settings
from profiles.models import OtherCountry, Country, City


PHONE_PATTERN = re.compile(
    r"""
    ^\+?                   # can be + in the begin
    (\d{1,4})?             # can be code of country in ()
    [\s-]*                 # can be spaces and -
    \(?\d{2,4}\)?          # can be code city or operators code in () (2-4 numbers)
    [\s-]*                 # can be spaces and -
    \d{2,4}                # first part of phone number
    [\s-]*                 # can be spaces and -
    \d{2,4}                # second part of phone number
    ([\s-]*\d{1,4})?       # 3th part of phone number
    $""",
    re.VERBOSE,
)


def validate_city_format(city: str) -> str:
    if not city.strip():
        raise serializers.ValidationError("City field may not be blank.")
    if not city.replace(" ", "").isalpha():
        raise serializers.ValidationError("The city name must contain only letters.")
    return city.title()


def validate_phone_number(phone_number: str) -> str:
    phone_number = phone_number.strip()
    numeric_phone_number = (
        phone_number.replace(" ", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
        .replace("+", "")
    )
    if not numeric_phone_number.isnumeric():
        raise serializers.ValidationError(
            f"The phone number '{numeric_phone_number}' must contain only numbers and especial symbols."
        )
    _len = len(numeric_phone_number)
    if _len < 8 or _len > 15:
        raise serializers.ValidationError(
            f"Count of numbers in '{phone_number}' = {_len}. The phone number must be between 8 and 15 digits."
        )
    if not bool(PHONE_PATTERN.match(phone_number)):
        raise serializers.ValidationError(
            "Check the entered phone number for compliance."
        )
    return phone_number


def validate_city_country_pair(city: str, country: Country | OtherCountry) -> Country:
    if isinstance(country, OtherCountry):
        country_code = OtherCountry.objects.get(id=country.id).code
    else:
        country_code = OtherCountry.objects.filter(name=country.name).first().code

    city = validate_city_format(city)

    api_url = "https://api.api-ninjas.com/v1/city?name={}".format(city)
    response = requests.get(api_url, headers={"X-Api-Key": settings.XN_API_KEY})
    if response.status_code == requests.codes.ok:
        try:
            data = response.json()
            api_code_country = data[0]["country"]
            city_name = data[0]["name"]
        except (KeyError, IndexError):
            raise serializers.ValidationError(
                f"City '{city}' doesn't exist. Please try again."
            )

        if api_code_country and api_code_country == country_code:
            print(response.json())
            print(api_code_country)

        else:
            if city_name != city:
                raise serializers.ValidationError(
                    f"City '{city}' not fount in country '{country.name}' maybe you meant '{city_name}'?"
                )
            raise serializers.ValidationError(
                f"City '{city}' not found in '{country.name}'."
            )
    else:
        print("Error:", response.status_code, response.text)

    print(f"{country=}")
    return country


def validate_profile_city_country_validated_data(validated_data, instance=None):
    other_country = validated_data.pop("other_country", None)
    other_city_name = validated_data.pop("other_city", "").strip()
    selected_country = validated_data.pop("country", None)
    selected_city = validated_data.pop("city", None)
    phone_number = validated_data.pop("phone_number", None)

    # Get or create country
    if other_country:
        country = other_country
    elif selected_country:
        country = selected_country
    elif instance and instance.city and instance.city.country:
        country = instance.city.country
    else:
        raise serializers.ValidationError("Please select a country or enter your own.")

    # Get or create city
    if other_city_name:
        new_country, _ = Country.objects.get_or_create(name=country.name)
        country = validate_city_country_pair(other_city_name, country=new_country)

        city, _ = City.objects.get_or_create(name=other_city_name, country=country)

    elif selected_city:
        city = selected_city
    elif instance and instance.city:
        city = instance.city
    else:
        raise serializers.ValidationError("Please select a city or enter your own.")

    validated_data["city"] = city

    print(f"------------   validation {phone_number} ------------------")
    if not phone_number:
        validated_data["phone_number"] = None
    else:
        validated_data["phone_number"] = validate_phone_number(phone_number)

    return validated_data


# if "__main__" == __name__:
#     validate_city_country_pair("Bariloche", country=1, other_country=None)
#     validate_phone_number("(056)11-22-334")
