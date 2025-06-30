from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrIsOwner(BasePermission):
    def has_object_permission(self, request, view, obj=None):
        print(f"User: {request.user}, Object owner: {obj.owner}")
        if obj.status == "Application":
            return request.user == obj.owner or request.user.is_staff
        return True
