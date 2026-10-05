from django.conf import settings

from google import genai

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_insight(request):

    try:

        # =========================
        # GEMINI CLIENT
        # =========================

        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        # =========================
        # BASIC GEMINI TEST
        # =========================

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents="Say hello in one sentence."
        )

        print("======================================")
        print("GEMINI RESPONSE:", response.text)
        print("======================================")

        return Response(
            {
                "message": "Gemini test successful",
                "response": response.text,
            }
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