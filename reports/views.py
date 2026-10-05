from django.db.models import Sum, F

from rest_framework.decorators import api_view
from rest_framework.response import Response

from customers.models import Customer
from products.models import Product
from purchases.models import Purchase


@api_view(["GET"])
def report_summary(request):

    # =========================
    # BASIC COUNTS
    # =========================

    total_customers = Customer.objects.filter(
        is_active=True
    ).count()

    total_products = Product.objects.count()

    total_purchases = Purchase.objects.count()

    # =========================
    # TOTAL REVENUE
    # =========================

    total_revenue = (
        Purchase.objects.aggregate(
            total=Sum("total_amount")
        )["total"]
        or 0
    )

    # =========================
    # TOTAL ITEMS SOLD
    # =========================

    total_items_sold = (
        Purchase.objects.aggregate(
            total=Sum("quantity")
        )["total"]
        or 0
    )

    # =========================
    # LOW STOCK PRODUCTS
    # =========================

    low_stock_queryset = Product.objects.filter(
        current_stock__lte=F("low_stock_limit")
    ).order_by("current_stock")

    low_stock_products = low_stock_queryset.count()

    # Detailed low-stock product list
    low_stock_products_list = list(
        low_stock_queryset.values(
            "id",
            "name",
            "product_code",
            "current_stock",
            "low_stock_limit",
        )
    )

    # =========================
    # RESPONSE
    # =========================

    return Response(
        {
            "total_customers": total_customers,
            "total_products": total_products,
            "total_purchases": total_purchases,
            "total_revenue": total_revenue,
            "total_items_sold": total_items_sold,

            "low_stock_products": low_stock_products,

            "low_stock_products_list": low_stock_products_list,
        }
    )