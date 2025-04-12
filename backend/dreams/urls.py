from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoryView, DreamViewSet, DreamStatisticsView, DonationViewSet

app_name = "dreams"

router = DefaultRouter()
router.register(r"categories", CategoryView, basename="category")
router.register(r"dreams", DreamViewSet, basename="dreams")
router.register(r"donations", DonationViewSet)


urlpatterns = [
    path("statistics/", DreamStatisticsView.as_view(), name="dream_statistics"),
]

urlpatterns += router.urls
