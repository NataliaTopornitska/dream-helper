from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryView,
    DreamViewSet,
    DreamStatisticsView,
    DonationViewSet,
    CommentViewSet,
)

app_name = "dreams"

router = DefaultRouter()
router.register(r"categories", CategoryView, basename="category")
router.register(r"dreams", DreamViewSet, basename="dreams")
router.register(r"donations", DonationViewSet, basename="donations")
router.register(r"comments", CommentViewSet, basename="comments")


urlpatterns = [
    path("statistics/", DreamStatisticsView.as_view(), name="dream_statistics"),
]

urlpatterns += router.urls
