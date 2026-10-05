from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from customers.models import Customer
from purchases.models import Purchase


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_search(request):

    query = request.GET.get("q", "").strip()

    if not query:
        return Response({
            "products": [],
            "customers": [],
            "purchases": [],
        })

    # Search Products
    products = Product.objects.filter(
        Q(name__icontains=query) |
        Q(product_code__icontains=query) |
        Q(hsn_code__icontains=query)
    ).values(
        "id",
        "name",
        "product_code",
        "current_stock",
        "mrp",
    )[:5]

    # Search Customers
    customers = Customer.objects.filter(
        Q(name__icontains=query) |
        Q(phone__icontains=query) |
        Q(email__icontains=query)
    ).values(
        "id",
        "name",
        "phone",
        "email",
        "city",
    )[:5]

    # Search Purchases
    purchases = Purchase.objects.filter(
        Q(customer__name__icontains=query) |
        Q(product__name__icontains=query)
    ).values(
        "id",
        "customer__name",
        "product__name",
        "quantity",
        "total_amount",
        "created_at",
    )[:5]

    return Response({
        "products": list(products),
        "customers": list(customers),
        "purchases": list(purchases),
    })