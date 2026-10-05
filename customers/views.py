from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import Customer
from .serializers import CustomerSerializer
from .permissions import CustomerPermission


@api_view(["GET", "POST"])
@permission_classes([CustomerPermission])
def customer_list(request):

    # GET → All customers
    if request.method == "GET":
        customers = Customer.objects.all().order_by("-created_at")

        serializer = CustomerSerializer(
            customers,
            many=True
        )

        return Response(serializer.data)

    # POST → Create customer
    if request.method == "POST":
        serializer = CustomerSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([CustomerPermission])
def customer_detail(request, pk):

    # Find customer
    try:
        customer = Customer.objects.get(pk=pk)

    except Customer.DoesNotExist:
        return Response(
            {"error": "Customer not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET → Single customer
    if request.method == "GET":
        serializer = CustomerSerializer(customer)

        return Response(serializer.data)

    # PUT → Update customer
    if request.method == "PUT":
        serializer = CustomerSerializer(
            customer,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # DELETE → Delete customer
    if request.method == "DELETE":
        customer.delete()

        return Response(
            {"message": "Customer deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )