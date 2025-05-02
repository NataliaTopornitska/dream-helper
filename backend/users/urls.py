from django.urls import path
from rest_framework.routers import DefaultRouter

from users.views import (
    CreateUserView,
    activate_user,
    LoginUserView,
    ManageUserView,
    LogoutUserView,
    UserProfileView,
    SubscriberView,
    DreamerProfileView,
    UploadAvatarView,
    CountryView,
    CityView,
)

app_name = "users"

router = DefaultRouter()
router.register(r"subscribers", SubscriberView, basename="subscribers")
router.register(r"dreamers", DreamerProfileView, basename="dreamers")
router.register(r"countries", CountryView, basename="countries")
router.register(r"cities", CityView, basename="cities")

urlpatterns = [
    path("register/", CreateUserView.as_view(), name="create"),
    path("activate/<int:pk>/<str:activationtoken>", activate_user, name="activate"),
    path("login/", LoginUserView.as_view(), name="token"),
    path("me/", ManageUserView.as_view(), name="manage"),
    path("logout/", LogoutUserView.as_view(), name="logout"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("profile/upload_avatar/", UploadAvatarView.as_view(), name="upload_avatar"),
]

urlpatterns += router.urls
