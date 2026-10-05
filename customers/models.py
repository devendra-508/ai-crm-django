from django.db import models


class Customer(models.Model):
    CUSTOMER_TYPES = [
        ("Regular", "Regular"),
        ("Wholesale", "Wholesale"),
        ("VIP", "VIP"),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)

    customer_type = models.CharField(
        max_length=20,
        choices=CUSTOMER_TYPES,
        default="Regular"
    )

    total_purchase_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name