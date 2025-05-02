import django_filters

from users.models import Country, City


class CityFilter(django_filters.FilterSet):
    country = django_filters.ModelChoiceFilter(
        queryset=Country.objects.all(),
        label="Country ID",
    )

    class Meta:
        model = City
        fields = ("country",)
