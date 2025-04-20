import django_filters
from django.db.models import Q, F

from .models import Dream
from users.models import City, Country


class DreamFilter(django_filters.FilterSet):
    goal_range = django_filters.RangeFilter(field_name="goal", label="Goal Range")
    country = django_filters.ModelChoiceFilter(
        queryset=Country.objects.all(),
        field_name="country",
        label="Country",
        method="filter_country",
    )
    city = django_filters.ModelChoiceFilter(
        queryset=City.objects.all(),
        label="City",
        method="filter_city",
    )

    class Meta:
        model = Dream
        fields = (
            "status",
            "categories",
            "goal_range",
            "country",
            "city",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # if country, get cities only of this country
        country_id = self.data.get("country")
        if country_id:
            try:
                country_id = int(country_id)
                self.filters["city"].queryset = City.objects.filter(
                    country_id=country_id
                )
            except ValueError:
                self.filters["city"].queryset = City.objects.all()
        else:
            self.filters["city"].queryset = City.objects.all()

    def filter_country(self, queryset, name, value):
        # get pk of country
        country_pk = value.pk if hasattr(value, "pk") else value

        # annotate country for dreamer
        # & country for owner (in his profile)
        queryset = queryset.annotate(
            dreamer_country_id=F("dreamer__city__country_id"),
            owner_country_id=F("owner__userprofile__city__country_id"),
        )

        # if dreamer not null - using this value
        # else check owner (his profile)
        return queryset.filter(
            Q(dreamer__isnull=False, dreamer_country_id=country_pk)
            | Q(dreamer__isnull=True, owner_country_id=country_pk)
        )

    def filter_city(self, queryset, name, value):
        return queryset.filter(
            Q(dreamer__city=value) | Q(owner__userprofile__city=value)
        )
