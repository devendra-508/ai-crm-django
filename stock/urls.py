from django.urls import path

from .views import adjust_stock


urlpatterns = [
    path("adjust/", adjust_stock, name="adjust-stock"),
]