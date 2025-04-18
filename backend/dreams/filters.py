import django_filters
from django.db.models import Q

from .models import Dream
from users.models import City


class DreamFilter(django_filters.FilterSet):
    goal_range = django_filters.RangeFilter(field_name="goal", label="Goal Range")
    # city = django_filters.ModelChoiceFilter(
    #     queryset=City.objects.all(),
    #     label="City",
    #     method="filter_city",
    # )

    class Meta:
        model = Dream
        fields = (
            "status",
            "categories",
            "goal_range",
            # "city",
        )

    # def filter_city(self, queryset, name, value):
    #     return queryset.filter(Q(dreamer__city=value) | Q(owner__city=value))
