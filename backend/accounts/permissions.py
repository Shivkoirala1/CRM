from rest_framework.permissions import BasePermission


class IsManagerOrAdmin(BasePermission):
    """
    Allows access only to users with role MANAGER or ADMIN.
    Used to restrict sensitive actions like delete/archive.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ['MANAGER', 'ADMIN']
        )


class IsAdmin(BasePermission):
    """
    Allows access only to users with role ADMIN (CEO).
    Used for the most sensitive actions, e.g. user management.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )