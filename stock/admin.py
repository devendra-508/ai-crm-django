from django.contrib import admin
from .models import StockLog


@admin.register(StockLog)
class StockLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "stock_type",
        "quantity",
        "reason",
        "created_at",
    )

    search_fields = (
        "product__name",
        "product__product_code",
        "reason",
    )

    list_filter = (
        "stock_type",
        "created_at",
    )