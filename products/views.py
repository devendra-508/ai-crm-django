import csv

from io import TextIOWrapper

from django.http import HttpResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import Product
from .serializers import ProductSerializer
from .permissions import ProductPermission


@api_view(["GET", "POST"])
@permission_classes([ProductPermission])
def product_list(request):

    # GET → Get all products
    if request.method == "GET":
        products = Product.objects.all().order_by("-created_at")

        serializer = ProductSerializer(
            products,
            many=True
        )

        return Response(serializer.data)

    # POST → Create product
    if request.method == "POST":
        serializer = ProductSerializer(
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
@permission_classes([ProductPermission])
def product_detail(request, pk):

    # Find product
    try:
        product = Product.objects.get(pk=pk)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET → Get single product
    if request.method == "GET":
        serializer = ProductSerializer(product)

        return Response(
            serializer.data
        )

    # PUT → Update product
    if request.method == "PUT":
        serializer = ProductSerializer(
            product,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

   # DELETE → Deactivate product
    if request.method == "DELETE":
     product.is_active = False
     product.save(update_fields=["is_active"])

     return Response(
        {"message": "Product deactivated successfully"},
        status=status.HTTP_200_OK
     )


@api_view(["GET"])
@permission_classes([ProductPermission])
def export_products_csv(request):

    products = Product.objects.all().order_by("id")

    response = HttpResponse(
        content_type="text/csv"
    )

    response["Content-Disposition"] = (
        'attachment; filename="products.csv"'
    )

    writer = csv.writer(response)

    writer.writerow([
        "ID",
        "Name",
        "Product Code",
        "HSN Code",
        "GST Rate",
        "Batch Number",
        "Purchase Rate",
        "MRP",
        "Expiry Date",
        "Current Stock",
        "Low Stock Limit",
        "Created At",
    ])

    for product in products:
        writer.writerow([
            product.id,
            product.name,
            product.product_code,
            product.hsn_code,
            product.gst_rate,
            product.batch_number,
            product.purchase_rate,
            product.mrp,
            product.expiry_date,
            product.current_stock,
            product.low_stock_limit,
            product.created_at,
        ])

    return response

@api_view(["POST"])
@permission_classes([ProductPermission])
def import_products_csv(request):

    if "file" not in request.FILES:
        return Response(
            {"error": "CSV file is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    csv_file = request.FILES["file"]

    if not csv_file.name.endswith(".csv"):
        return Response(
            {"error": "Only CSV files are allowed"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        file = TextIOWrapper(
            csv_file.file,
            encoding="utf-8"
        )

        reader = csv.DictReader(file)

        created_products = []
        errors = []

        for row_number, row in enumerate(reader, start=2):

            product_code = row.get("Product Code")

            if not product_code:
                errors.append(
                    {
                        "row": row_number,
                        "error": "Product Code is required"
                    }
                )
                continue

            if Product.objects.filter(
                product_code=product_code
            ).exists():
                errors.append(
                    {
                        "row": row_number,
                        "error": f"Product code {product_code} already exists"
                    }
                )
                continue

            try:
                product = Product.objects.create(
                    name=row.get("Name"),
                    product_code=product_code,
                    hsn_code=row.get("HSN Code") or None,
                    gst_rate=row.get("GST Rate") or 0,
                    batch_number=row.get("Batch Number") or None,
                    purchase_rate=row.get("Purchase Rate"),
                    mrp=row.get("MRP"),
                    expiry_date=row.get("Expiry Date") or None,
                    current_stock=row.get("Current Stock") or 0,
                    low_stock_limit=row.get("Low Stock Limit") or 10,
                )

                created_products.append(product.id)

            except Exception as e:
                errors.append(
                    {
                        "row": row_number,
                        "error": str(e)
                    }
                )

        return Response(
            {
                "message": "CSV import completed",
                "created_count": len(created_products),
                "created_product_ids": created_products,
                "errors": errors,
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": f"Failed to process CSV: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )