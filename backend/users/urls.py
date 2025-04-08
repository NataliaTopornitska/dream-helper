from django.urls import path

from users.views import CreateUserView, activate_user

app_name = "users"


urlpatterns = [
    path("register/", CreateUserView.as_view(), name="create"),
    path("activate/<int:pk>/<str:activationtoken>", activate_user, name="activate"),
]