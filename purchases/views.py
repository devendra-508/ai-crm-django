from django.db import transaction

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from customers.models import Customer
from products.models import Product
from stock.models import StockLog

from .models import Purchase
from .serializers import PurchaseSerializer
from .permissions import PurchasePermission

from notifications.services import send_notification
from django.contrib.auth.models import User


@api_view(["GET", "POST"])
@permission_classes([PurchasePermission])
def purchase_list(request):

    # GET - Fetch all purchases
    if request.method == "GET":
        purchases = Purchase.objects.all().order_by("-created_at")
        serializer = PurchaseSerializer(
            purchases,
            many=True
        )

        return Response(serializer.data)

    # POST - Create purchase
    if request.method == "POST":

        customer_id = request.data.get("customer")
        product_id = request.data.get("product")
        quantity = request.data.get("quantity")

        # Required fields validation
        if not customer_id or not product_id or not quantity:
            return Response(
                {
                    "error": "customer, product and quantity are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate quantity
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

        # Find customer
        try:
            customer = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Find product
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check stock
        if quantity > product.current_stock:
            return Response(
                {
                    "error": "Insufficient stock",
                    "current_stock": product.current_stock,
                    "requested_quantity": quantity,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Database transaction
        with transaction.atomic():

            unit_price = product.mrp
            total_amount = unit_price * quantity

            # Create purchase
            purchase = Purchase.objects.create(
                customer=customer,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                total_amount=total_amount,
            )

            

            

            # Reduce product stock
            product.current_stock -= quantity
            product.save()

            # Update customer's total purchase amount
            customer.total_purchase_amount += total_amount
            customer.save()

            # Create stock OUT history
            StockLog.objects.create(
                product=product,
                stock_type="OUT",
                quantity=quantity,
                reason="Customer Purchase",
            )

                    # Send real-time notification to staff users
        staff_users = User.objects.filter(
            is_active=True,
            is_staff=True
        )

        for user in staff_users:
            send_notification(
                user=user,
                title="New Purchase",
                message=(
                    f"{customer.name} purchased "
                    f"{quantity} × {product.name}."
                ),
                notification_type="PURCHASE",
            )

        serializer = PurchaseSerializer(purchase)

        return Response(
            {
                "message": "Purchase created successfully",
                "purchase": serializer.data,
                "remaining_stock": product.current_stock,
                "customer_total_purchase": customer.total_purchase_amount,
            },
            status=status.HTTP_201_CREATED,
        )