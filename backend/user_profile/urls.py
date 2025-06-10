from django.urls import path
from rest_framework.routers import DefaultRouter

from user_profile.views import (
    UserProfileView,
    DreamerProfileView,
    UploadAvatarView,
    CountryView,
    CityView,
    UserMyDreamsView,
    UserMyDonationsView,
    UserPreparedDonationsView,
)

app_name = "user_profile"


router = DefaultRouter()
router.register(r"dreamers", DreamerProfileView, basename="dreamers")
router.register(r"countries", CountryView, basename="countries")
router.register(r"cities", CityView, basename="cities")


urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("profile/upload_avatar/", UploadAvatarView.as_view(), name="upload_avatar"),
    path("profile/my_dreams/", UserMyDreamsView.as_view(), name="my_dreams"),
    path("profile/my_donations/", UserMyDonationsView.as_view(), name="my_donations"),
    path(
        "profile/prepared_donations/",
        UserPreparedDonationsView.as_view(),
        name="prepared_donations",
    ),
]

urlpatterns += router.urls
