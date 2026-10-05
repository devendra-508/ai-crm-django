from django.urls import path

from .views import (
    product_list,
    product_detail,
    export_products_csv,
    import_products_csv,
)

urlpatterns = [
    path("", product_list, name="product-list"),

    path(
        "export/",
        export_products_csv,
        name="product-export",
    ),

    path(
        "import/",
        import_products_csv,
        name="product-import",
    ),

    path(
        "<int:pk>/",
        product_detail,
        name="product-detail",
    ),
]