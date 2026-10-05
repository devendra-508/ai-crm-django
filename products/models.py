from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=150)

    product_code = models.CharField(
        max_length=50,
        unique=True
    )

    hsn_code = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    gst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    batch_number = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    purchase_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    expiry_date = models.DateField(
        blank=True,
        null=True
    )

    current_stock = models.PositiveIntegerField(
        default=0
    )

    low_stock_limit = models.PositiveIntegerField(
        default=10
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.name} ({self.product_code})"