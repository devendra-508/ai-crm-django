from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "phone",
        "email",
        "customer_type",
        "total_purchase_amount",
        "is_active",
        "created_at",
    )

    search_fields = ("name", "phone", "email")

    list_filter = ("customer_type", "is_active")