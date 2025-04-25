import django_filters
from django.db.models import Q, F

from .models import Dream, Category
from users.models import City, Country


class DreamFilter(django_filters.FilterSet):
    GOAL_CHOICES = (
        ("until_100", "Until 100"),
        ("101_500", "101 - 500"),
        ("501_1000", "501 - 1000"),
        ("more_1000", "More than 1000"),
    )
    DREAM_TYPE_CHOICES = (
        (False, "Personal"),
        (True, "Collective"),
    )

    category = django_filters.ModelChoiceFilter(
        queryset=Category.objects.all(),
        field_name="categories",
        label="Category",
    )
    goal_range = django_filters.ChoiceFilter(
        choices=GOAL_CHOICES,
        method="filter_goal_range",
        label="Goal Range",
    )
    dream_type = django_filters.ChoiceFilter(
        choices=DREAM_TYPE_CHOICES,
        method="filter_dream_type",
        label="Dream Type",
    )
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
    popularity = django_filters.OrderingFilter(
        # may second field for display to UI
        fields=(
            ("goal"),
            ("created_at"),
            ("number_views"),
            ("number_donations"),
            ("total_amount_donations"),
            ("number_comments"),
        ),
        label="Popularity",
    )

    class Meta:
        model = Dream
        fields = (
            "status",
            "category",
            "goal_range",
            "dream_type",
            "country",
            "city",
            "popularity",
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

    def filter_dream_type(self, queryset, name, value):
        return queryset.filter(
            Q(dreamer__is_collective=value)
            | Q(dreamer__isnull=True, owner__userprofile__is_collective=value)
        )

    def filter_goal_range(self, queryset, name, value):
        if value == "until_100":
            return queryset.filter(goal__lte=100)
        elif value == "101_500":
            return queryset.filter(goal__gte=101, goal__lte=500)
        elif value == "501_1000":
            return queryset.filter(goal__gte=501, goal__lte=1000)
        elif value == "more_1000":
            return queryset.filter(goal__gt=1000)
        return queryset
