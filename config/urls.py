from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/auth/",
        include("accounts.urls"),
    ),

    path(
        "api/customers/",
        include("customers.urls"),
    ),

    path(
        "api/products/",
        include("products.urls"),
    ),

    path(
        "api/stock/",
        include("stock.urls"),
    ),

    path(
        "api/purchases/",
        include("purchases.urls"),
    ),

    path(
        "api/reports/",
        include("reports.urls"),
    ),

    path(
        "api/dashboard/",
        include("dashboard.urls"),
    ),

    path(
        "api/ai-insights/",
        include("ai_insights.urls"),
    ),

    path(
    "api/notifications/",
    include("notifications.urls")
    ),
    
    path(
    "api/search/",
    include("search_api.urls"),
    ),
]