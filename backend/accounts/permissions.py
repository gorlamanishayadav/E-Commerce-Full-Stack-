from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class IsSellerUserRole(permissions.BasePermission):
    """
    Allows access to Sellers or Admins.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['SELLER', 'ADMIN'] or request.user.is_superuser)
        )

class IsCustomerUserRole(permissions.BasePermission):
    """
    Allows access to Customer users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'CUSTOMER'
        )

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Read-only for everyone; Create/Update/Delete requires Seller or Admin.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['SELLER', 'ADMIN'] or request.user.is_superuser)
        )

class IsProductOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission: only the product's seller or an Admin can edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        return hasattr(obj, 'seller') and obj.seller == request.user

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission: only the owner of the object or an Admin can edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        return False
