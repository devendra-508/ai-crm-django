from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from products.models import Product

from .models import StockLog
from .serializers import StockLogSerializer
from .permissions import StockPermission


@api_view(["POST"])
@permission_classes([StockPermission])
def adjust_stock(request):

    product_id = request.data.get("product")
    stock_type = request.data.get("stock_type")
    quantity = request.data.get("quantity")
    reason = request.data.get("reason", "")

    if not product_id or not stock_type or not quantity:
        return Response(
            {
                "error": "product, stock_type and quantity are required"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if stock_type not in ["IN", "OUT"]:
        return Response(
            {"error": "stock_type must be IN or OUT"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        return Response(
            {"error": "quantity must be a valid number"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quantity <= 0:
        return Response(
            {"error": "quantity must be greater than 0"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if stock_type == "OUT" and quantity > product.current_stock:
        return Response(
            {
                "error": "Insufficient stock",
                "current_stock": product.current_stock,
                "requested_quantity": quantity,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if stock_type == "IN":
        product.current_stock += quantity
    else:
        product.current_stock -= quantity

    product.save()

    stock_log = StockLog.objects.create(
        product=product,
        stock_type=stock_type,
        quantity=quantity,
        reason=reason,
    )

    serializer = StockLogSerializer(stock_log)

    return Response(
        {
            "message": "Stock updated successfully",
            "stock": serializer.data,
            "current_stock": product.current_stock,
        },
        status=status.HTTP_200_OK,
    )