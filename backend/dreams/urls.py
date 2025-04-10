from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoryView, DreamViewSet, DreamStatisticsView

app_name = "dreams"

router = DefaultRouter()
router.register(r"categories", CategoryView, basename="category")
router.register(r"dreams", DreamViewSet, basename="dreams")


urlpatterns = [
    path("statistics/", DreamStatisticsView.as_view(), name="dream_statistics"),
]

urlpatterns += router.urls
