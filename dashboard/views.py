from django.db import models
from django.db.models import Sum

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from customers.models import Customer
from products.models import Product
from purchases.models import Purchase


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):

    # =========================
    # Basic Dashboard Statistics
    # =========================

    total_customers = Customer.objects.filter(is_active=True).count()

    total_products = Product.objects.count()

    total_purchases = Purchase.objects.count()

    total_revenue = Purchase.objects.aggregate(total=Sum("total_amount"))["total"] or 0

    total_items_sold = Purchase.objects.aggregate(total=Sum("quantity"))["total"] or 0

    # =========================
    # Low Stock Products
    # =========================

    low_stock_products = Product.objects.filter(
        current_stock__lte=models.F("low_stock_limit")
    ).count()

    # =========================
    # Recent Purchases
    # =========================

    recent_purchases = Purchase.objects.select_related("customer", "product").order_by(
        "-created_at"
    )[:5]

    recent_data = []

    for purchase in recent_purchases:
        recent_data.append(
            {
                "id": purchase.id,
                "customer": purchase.customer.name,
                "product": purchase.product.name,
                "quantity": purchase.quantity,
                "total_amount": purchase.total_amount,
                "created_at": purchase.created_at,
            }
        )

    # =========================
    # Product-wise Sales
    # =========================

    product_sales = (
        Purchase.objects.values(
            "product__name",
            "product__product_code",
        )
        .annotate(quantity=Sum("quantity"))
        .order_by("-quantity")
    )

    product_sales_data = []

    for item in product_sales:
        product_sales_data.append(
            {
                "product": item["product__name"],
                "product_code": item["product__product_code"],
                "quantity": item["quantity"],
            }
        )

    # =========================
    # Revenue Trend
    # =========================

    purchases_for_chart = Purchase.objects.filter(created_at__isnull=False).order_by(
        "created_at"
    )

    revenue_by_date = {}

    for purchase in purchases_for_chart:

        date = purchase.created_at.date()

        if date not in revenue_by_date:
            revenue_by_date[date] = 0

        revenue_by_date[date] += purchase.total_amount

    revenue_trend_data = []

    for date, revenue in revenue_by_date.items():

        revenue_trend_data.append(
            {
                "date": date.strftime("%d %b"),
                "revenue": revenue,
            }
        )

    # =========================
    # API Response
    # =========================

    return Response(
        {
            "total_customers": total_customers,
            "total_products": total_products,
            "total_purchases": total_purchases,
            "total_revenue": total_revenue,
            "total_items_sold": total_items_sold,
            "low_stock_products": low_stock_products,
            "recent_purchases": recent_data,
            "product_sales": product_sales_data,
            "revenue_trend": revenue_trend_data,
        }
    )
