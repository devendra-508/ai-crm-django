from django.db import models
from products.models import Product


class StockLog(models.Model):
    STOCK_TYPES = [
        ("IN", "Stock In"),
        ("OUT", "Stock Out"),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="stock_logs",
    )

    stock_type = models.CharField(
        max_length=3,
        choices=STOCK_TYPES,
    )

    quantity = models.PositiveIntegerField()

    reason = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.stock_type} - {self.quantity}"