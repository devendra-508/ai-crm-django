from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):

    notifications = Notification.objects.filter(
        user=request.user
    ).order_by("-created_at")

    serializer = NotificationSerializer(
        notifications,
        many=True
    )

    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):

    try:
        notification = Notification.objects.get(
            pk=pk,
            user=request.user
        )
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    serializer = NotificationSerializer(notification)

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):

    try:
        notification = Notification.objects.get(
            pk=pk,
            user=request.user
        )
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    notification.delete()

    return Response(
        {"message": "Notification deleted successfully"},
        status=status.HTTP_204_NO_CONTENT
    )