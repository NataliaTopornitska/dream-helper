from rest_framework.routers import DefaultRouter
from .views import CategoryView


app_name = "dreams"

router = DefaultRouter()
router.register(r"categories", CategoryView, basename="category")


urlpatterns = [
    # ...
]

urlpatterns += router.urls
