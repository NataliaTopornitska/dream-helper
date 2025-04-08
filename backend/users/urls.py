from django.urls import path

from users.views import CreateUserView, activate_user, LoginUserView, ManageUserView, LogoutUserView


app_name = "users"


urlpatterns = [
    path("register/", CreateUserView.as_view(), name="create"),
    path("activate/<int:pk>/<str:activationtoken>", activate_user, name="activate"),
    path("login/", LoginUserView.as_view(), name="token"),
    path("me/", ManageUserView.as_view(), name="manage"),
    path("logout/", LogoutUserView.as_view(), name="logout"),
]