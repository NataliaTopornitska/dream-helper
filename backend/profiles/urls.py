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
)

app_name = "profiles"


router = DefaultRouter()
router.register(r"dreamers", DreamerProfileView, basename="dreamers")
router.register(r"countries", CountryView, basename="countries")
router.register(r"cities", CityView, basename="cities")


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
