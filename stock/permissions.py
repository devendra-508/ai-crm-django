from rest_framework import permissions


class StockPermission(permissions.BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser → full access
        if request.user.is_superuser:
            return True

        # GET → View stock logs
        if request.method == "GET":
            return request.user.has_perm("stock.view_stocklog")

        # POST → Add stock log / adjust stock
        if request.method == "POST":
            return request.user.has_perm("stock.add_stocklog")

        # PUT / PATCH → Change stock log
        if request.method in ["PUT", "PATCH"]:
            return request.user.has_perm("stock.change_stocklog")

        # DELETE → Delete stock log
        if request.method == "DELETE":
            return request.user.has_perm("stock.delete_stocklog")

        return False