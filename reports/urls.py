from django.urls import path

from .views import report_summary


urlpatterns = [
    path("summary/", report_summary, name="report-summary"),
]