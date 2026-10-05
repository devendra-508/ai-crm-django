from rest_framework import permissions


class PurchasePermission(permissions.BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser → full access
        if request.user.is_superuser:
            return True

        # GET → View purchases
        if request.method == "GET":
            return request.user.has_perm("purchases.view_purchase")

        # POST → Add purchase
        if request.method == "POST":
            return request.user.has_perm("purchases.add_purchase")

        # PUT / PATCH → Change purchase
        if request.method in ["PUT", "PATCH"]:
            return request.user.has_perm("purchases.change_purchase")

        # DELETE → Delete purchase
        if request.method == "DELETE":
            return request.user.has_perm("purchases.delete_purchase")

        return False