from django.urls import path

from .views import purchase_list


urlpatterns = [
    path("", purchase_list, name="purchase-list"),
]