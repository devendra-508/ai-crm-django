import json
import logging

from django.conf import settings
from django.db.models import F, Sum
from google import genai
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from customers.models import Customer
from products.models import Product
from purchases.models import Purchase


logger = logging.getLogger(__name__)


INSIGHTS_SCHEMA = {
    "type": "OBJECT",
    "required": [
        "summary",
        "sales_insights",
        "inventory_insights",
        "recommendations",
    ],
    "properties": {
        "summary": {"type": "STRING"},
        "sales_insights": {"type": "STRING"},
        "inventory_insights": {"type": "STRING"},
        "recommendations": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
        },
    },
}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insight(request):
    if not settings.GEMINI_API_KEY:
        return Response(
            {"error": "AI insights are not configured. Add GEMINI_API_KEY to the Railway backend environment."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    total_customers = Customer.objects.filter(is_active=True).count()
    total_products = Product.objects.filter(is_active=True).count()
    total_purchases = Purchase.objects.count()
    total_revenue = (
        Purchase.objects.aggregate(total=Sum("total_amount"))["total"] or 0
    )

    low_stock_products = list(
        Product.objects.filter(
            is_active=True,
            current_stock__lte=F("low_stock_limit"),
        )
        .order_by("current_stock")
        .values("name", "current_stock", "low_stock_limit")[:10]
    )

    top_products = list(
        Purchase.objects.values("product__name")
        .annotate(units_sold=Sum("quantity"), revenue=Sum("total_amount"))
        .order_by("-revenue")[:5]
    )

    crm_data = {
        "total_customers": total_customers,
        "total_products": total_products,
        "total_purchases": total_purchases,
        "total_revenue": str(total_revenue),
        "low_stock_products": low_stock_products,
        "top_products": top_products,
    }

    prompt = (
        "Act as a practical small-business CRM analyst. Analyze the following "
        "aggregate sales and inventory data. Do not invent trends or facts. "
        "Mention when there is not enough data. Return concise, useful content "
        "for a business owner. Return JSON with summary, sales_insights, "
        "inventory_insights, and a recommendations array.\n\n"
        f"CRM data: {json.dumps(crm_data, default=str)}"
    )

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": INSIGHTS_SCHEMA,
            },
        )
        ai_insights = json.loads(response.text)
    except Exception:
        logger.exception("Failed to generate AI insights")
        return Response(
            {"error": "AI insights could not be generated. Check the Gemini API key and Railway logs."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response({"crm_data": crm_data, "ai_insights": ai_insights})
