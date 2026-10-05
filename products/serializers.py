from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = "__all__"

    def validate_product_code(self, value):
        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError(
                "Product code cannot be empty."
            )

        return value

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Product name must contain at least 2 characters."
            )

        return value

    def validate(self, data):

        purchase_rate = data.get(
            "purchase_rate",
            getattr(self.instance, "purchase_rate", None)
        )

        mrp = data.get(
            "mrp",
            getattr(self.instance, "mrp", None)
        )

        if purchase_rate is not None and mrp is not None:
            if mrp < purchase_rate:
                raise serializers.ValidationError(
                    {
                        "mrp": "MRP cannot be lower than purchase rate."
                    }
                )

        current_stock = data.get(
            "current_stock",
            getattr(self.instance, "current_stock", 0)
        )

        low_stock_limit = data.get(
            "low_stock_limit",
            getattr(self.instance, "low_stock_limit", 10)
        )

        if current_stock < 0:
            raise serializers.ValidationError(
                {
                    "current_stock": "Stock cannot be negative."
                }
            )

        if low_stock_limit < 0:
            raise serializers.ValidationError(
                {
                    "low_stock_limit": "Low stock limit cannot be negative."
                }
            )

        return data