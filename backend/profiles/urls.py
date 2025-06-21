from django.urls import path
from rest_framework.routers import DefaultRouter

from profiles.views import (
    UserProfileView,
    DreamerProfileView,
    UploadAvatarView,
    CountryView,
    CityView,
    UserMyDreamsView,
    UserMyDonationsView,
    UserPreparedDonationsView,
    OtherCountryView,
)

app_name = "profiles"


router = DefaultRouter()
router.register("dreamers", DreamerProfileView, basename="dreamers")
router.register("countries", CountryView, basename="countries")
router.register("cities", CityView, basename="cities")
router.register("other_countries", OtherCountryView, basename="other_countries")


urlpatterns = [
    path("mine/", UserProfileView.as_view(), name="profile"),
    path("mine/upload_avatar/", UploadAvatarView.as_view(), name="upload_avatar"),
    path("mine/my_dreams/", UserMyDreamsView.as_view(), name="my_dreams"),
    path("mine/my_donations/", UserMyDonationsView.as_view(), name="my_donations"),
    path(
        "mine/prepared_donations/",
        UserPreparedDonationsView.as_view(),
        name="prepared_donations",
    ),
]

urlpatterns += router.urls
