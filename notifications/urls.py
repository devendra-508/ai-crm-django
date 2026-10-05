from django.urls import path, include

from .views import (
    notification_list,
    mark_notification_read,
    delete_notification,
)


urlpatterns = [
    path("", notification_list, name="notification-list"),

    path(
        "<int:pk>/read/",
        mark_notification_read,
        name="notification-read",
    ),

    path(
        "<int:pk>/",
        delete_notification,
        name="notification-delete",
    ),
    
]