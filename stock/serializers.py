from rest_framework import serializers

from .models import StockLog


class StockLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLog
        fields = "__all__"