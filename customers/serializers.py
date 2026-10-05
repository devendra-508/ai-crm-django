from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Customer
        fields = "__all__"

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Customer name must contain at least 2 characters."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) != 10:
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return value

    def validate_email(self, value):
        if value:
            return value.strip().lower()

        return value

    def validate(self, data):

        customer_type = data.get(
            "customer_type",
            getattr(self.instance, "customer_type", "Regular")
        )

        allowed_types = ["Regular", "Wholesale", "VIP"]

        if customer_type not in allowed_types:
            raise serializers.ValidationError(
                {
                    "customer_type": (
                        "Customer type must be Regular, Wholesale, or VIP."
                    )
                }
            )

        total_purchase_amount = data.get(
            "total_purchase_amount",
            getattr(self.instance, "total_purchase_amount", 0)
        )

        if total_purchase_amount < 0:
            raise serializers.ValidationError(
                {
                    "total_purchase_amount": (
                        "Total purchase amount cannot be negative."
                    )
                }
            )

        return data