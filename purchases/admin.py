from django.contrib import admin

from .models import Purchase


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "product",
        "quantity",
        "unit_price",
        "total_amount",
        "created_at",
    )

    search_fields = (
        "customer__name",
        "customer__phone",
        "product__name",
        "product__product_code",
    )

    list_filter = (
        "created_at",
    )