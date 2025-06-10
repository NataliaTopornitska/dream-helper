"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

from app.settings import API_PREF, DEBUG

from dreams.views import stripe_webhook
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from utils.stripe import CancelView, SuccessView

from debug_toolbar.toolbar import debug_toolbar_urls


urlpatterns = [
    path("admin/", admin.site.urls),
    path(f"{API_PREF}/users/", include("users.urls", namespace="users")),
    path(
        f"{API_PREF}/user_profile/",
        include("user_profile.urls", namespace="user_profile"),
    ),
    path(f"{API_PREF}/dreamhelper/", include("dreams.urls", namespace="dreams")),
    path(f"{API_PREF}/cancel/", CancelView.as_view(), name="cancel"),
    path(f"{API_PREF}/success/", SuccessView.as_view(), name="success"),
    path(f"{API_PREF}/webhook/", stripe_webhook, name="stripe-webhook"),
    path(f"{API_PREF}/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        f"{API_PREF}/doc/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

if DEBUG:
    urlpatterns += debug_toolbar_urls()
