from django.urls import path

from .views import ai_insight


urlpatterns = [
    path("", ai_insight, name="ai-insight"),
]