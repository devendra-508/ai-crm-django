import json

from django.conf import settings
from django.db.models import Sum, F

from google import genai

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from customers.models import Customer
from products.models import Product
from purchases.models import Purchase


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insight(request):

    # =========================
    # CRM SUMMARY
    # =========================

    total_customers = Customer.objects.filter(
        is_active=True
    ).count()

    total_products = Product.objects.count()

    total_purchases = Purchase.objects.count()

    total_revenue = (
        Purchase.objects.aggregate(
            total=Sum("total_amount")
        )["total"] or 0
    )

    # =========================
    # LOW STOCK PRODUCTS
    # =========================

    low_stock_products = Product.objects.filter(
        current_stock__lte=F("low_stock_limit")
    ).values(
        "name",
        "product_code",
        "current_stock",
        "low_stock_limit",
    )

    low_stock_data = list(low_stock_products)

    # =========================
    # PRODUCT-WISE SALES
    # =========================

    sales_data = (
        Purchase.objects
        .values(
            "product__name",
            "product__product_code",
        )
        .annotate(
            total_quantity=Sum("quantity")
        )
        .order_by("-total_quantity")
    )

    product_sales_data = list(sales_data)

    # =========================
    # GEMINI CLIENT
    # =========================

    try:

        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        # =========================
        # AI PROMPT
        # =========================

        prompt = f"""
You are an AI business assistant for a CRM application.

Analyze ONLY the CRM data provided below.

CRM SUMMARY:

Total active customers:
{total_customers}

Total products:
{total_products}

Total purchases:
{total_purchases}

Total revenue:
{total_revenue}

LOW STOCK PRODUCTS:

{low_stock_data}

PRODUCT-WISE SALES:

{product_sales_data}

Generate a concise business analysis.

Do not invent any information.
Use only the provided CRM data.
"""

        # =========================
        # GEMINI REQUEST
        # =========================

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string"
                        },
                        "sales_insights": {
                            "type": "string"
                        },
                        "inventory_insights": {
                            "type": "string"
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    },
                    "required": [
                        "summary",
                        "sales_insights",
                        "inventory_insights",
                        "recommendations"
                    ]
                }
            }
        )

        # =========================
        # PARSE AI RESPONSE
        # =========================

        ai_data = json.loads(response.text)

        return Response(
            {
                "message": "AI insights generated successfully",

                "crm_data": {
                    "total_customers": total_customers,
                    "total_products": total_products,
                    "total_purchases": total_purchases,
                    "total_revenue": total_revenue,
                    "low_stock_products": low_stock_data,
                    "product_sales": product_sales_data,
                },

                "ai_insights": ai_data,
            }
        )

    except json.JSONDecodeError:

        return Response(
            {
                "error": "Gemini returned an invalid JSON response",
                "raw_response": response.text,
            },
            status=500,
        )

    except Exception as e:

     print("======================================")
     print("GEMINI ERROR TYPE:", type(e).__name__)
     print("GEMINI ERROR:", repr(e))
     print("======================================")

    return Response(
        {
            "error": "Failed to generate AI insight",
            "error_type": type(e).__name__,
            "details": str(e),
        },
        status=500,
    )