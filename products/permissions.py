from rest_framework.permissions import BasePermission


class ProductPermission(BasePermission):

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        if request.method == "GET":
            return request.user.has_perm(
                "products.view_product"
            )

        if request.method == "POST":
            return request.user.has_perm(
                "products.add_product"
            )

        if request.method in ["PUT", "PATCH"]:
            return request.user.has_perm(
                "products.change_product"
            )

        if request.method == "DELETE":
            return request.user.has_perm(
                "products.delete_product"
            )

        return False