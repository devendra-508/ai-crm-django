from rest_framework import serializers

from .models import Purchase


class PurchaseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Purchase
        fields = "__all__"

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )

        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Unit price must be greater than 0."
            )

        return value

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Total amount must be greater than 0."
            )

        return value

    def validate(self, data):

        quantity = data.get("quantity")
        unit_price = data.get("unit_price")
        total_amount = data.get("total_amount")

        if (
            quantity is not None
            and unit_price is not None
            and total_amount is not None
        ):
            expected_total = quantity * unit_price

            if total_amount != expected_total:
                raise serializers.ValidationError(
                    {
                        "total_amount": (
                            "Total amount must equal "
                            "quantity × unit price."
                        )
                    }
                )

        return data