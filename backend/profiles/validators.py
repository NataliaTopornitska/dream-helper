import requests

from rest_framework import serializers
from app import settings
from profiles.models import OtherCountry, Country, City


def validate_city_format(city: str) -> str:
    if not city.strip():
        raise serializers.ValidationError("City field may not be blank.")
    if not city.replace(" ", "").isalpha():
        raise serializers.ValidationError("The city name must contain only letters.")
    return city.title()


def validate_city_country_pair(
    city: str, country: Country | OtherCountry
) -> Country:
    if isinstance(country, OtherCountry):
        country_code = OtherCountry.objects.get(id=country.id).code
    else:
        country_code = OtherCountry.objects.filter(name=country.name).first().code
    # country_code = "AR"

    city = validate_city_format(city)
    # if City.objects.filter(name=city, country=country).exists():
    #     raise serializers.ValidationError(
    #         f"The city '{city}' already exists, find please in '{country.name}'."
    #     )

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

        # if city_name != city:
        #     raise serializers.ValidationError(
        #       f"City '{city}' not fount in country '{country.name}' maybe you meant '{city_name}'?"
        #     )
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


def validate_profile_city_country_validated_data(validated_data):
    other_country = validated_data.pop("other_country", None)
    other_city_name = validated_data.pop("other_city", "").strip()
    selected_country = validated_data.pop("country", None)
    selected_city = validated_data.pop("city", None)

    # Get or create country
    if other_country:
      country = other_country
    elif selected_country:
      country = selected_country
    else:
      raise serializers.ValidationError(
        "Please select a country or enter your own."
      )

    # Get or create city
    if other_city_name:
      new_country, _ = Country.objects.get_or_create(name=country.name)
      country = validate_city_country_pair(other_city_name, country=new_country)

      city, _ = City.objects.get_or_create(name=other_city_name, country=country)

    elif selected_city:
      city = selected_city
    else:
      raise serializers.ValidationError("Please select a city or enter your own.")

    validated_data["city"] = city

    return validated_data



# if "__main__" == __name__:
#     validate_city_country_pair("Bariloche", country=1, other_country=None)
