from rest_framework.routers import DefaultRouter
from .views import CategoryView, DreamViewSet

app_name = "dreams"

router = DefaultRouter()
router.register(r"categories", CategoryView, basename="category")
router.register(r"dreams", DreamViewSet)


urlpatterns = [
    # ...
]

urlpatterns += router.urls
