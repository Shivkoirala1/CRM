from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from crm.utils import api_response
from .models import Notification
from .serializers import NotificationSerializer
from .utils import run_reminder_checks


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete', 'post']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        run_reminder_checks()
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        unread_count = queryset.filter(is_read=False).count()
        return api_response(
            success=True,
            message="Notifications retrieved successfully.",
            data={"unread_count": unread_count, "notifications": serializer.data}
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_response(success=True, message="Notification updated successfully.", data=serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return api_response(success=True, message="Notification deleted successfully.", data=None)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated_count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return api_response(
            success=True,
            message=f"Marked {updated_count} notification(s) as read.",
            data={"updated_count": updated_count}
        )