from rest_framework import permissions


class CustomerPermission(permissions.BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser → full access
        if request.user.is_superuser:
            return True

        # GET → View customer
        if request.method == "GET":
            return request.user.has_perm("customers.view_customer")

        # POST → Add customer
        if request.method == "POST":
            return request.user.has_perm("customers.add_customer")

        # PUT / PATCH → Change customer
        if request.method in ["PUT", "PATCH"]:
            return request.user.has_perm("customers.change_customer")

        # DELETE → Delete customer
        if request.method == "DELETE":
            return request.user.has_perm("customers.delete_customer")

        return False