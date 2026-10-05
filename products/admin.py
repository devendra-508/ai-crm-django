from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "product_code",
        "purchase_rate",
        "mrp",
        "current_stock",
        "low_stock_limit",
        "expiry_date",
        "created_at",
    )

    search_fields = (
        "name",
        "product_code",
        "batch_number",
    )

    list_filter = (
        "expiry_date",
    )