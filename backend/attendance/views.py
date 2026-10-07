from django.db.models import Q
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from crm.utils import api_response
from audit.utils import log_action
from audit.models import AuditLog
from accounts.models import User
from .models import Attendance
from .serializers import AttendanceSerializer
from .permissions import can_manage_attendance_for


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'date', 'status']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        user = self.request.user
        base = Attendance.objects.all().order_by('-date')

        if user.role in [User.Role.ADMIN, User.Role.MANAGER]:
            return base

        if user.role == User.Role.SUPERVISOR:
            return base.filter(Q(employee=user) | Q(employee__supervisor=user))

        return base.filter(employee=user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Attendance records retrieved successfully.",
            data=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(
            success=True,
            message="Attendance record retrieved successfully.",
            data=serializer.data
        )

    def create(self, request, *args, **kwargs):
        employee_id = request.data.get('employee')
        try:
            employee = User.objects.get(id=employee_id)
        except (User.DoesNotExist, TypeError, ValueError):
            return api_response(
                success=False,
                message="Operation failed.",
                errors={"employee": "This employee does not exist."},
                status_code=400
            )

        if not can_manage_attendance_for(request.user, employee):
            return api_response(
                success=False,
                message="Operation failed.",
                errors={"detail": "You don't have permission to mark attendance for this employee."},
                status_code=403
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(marked_by=request.user)
        log_action(
            request, AuditLog.ActionType.CREATE, serializer.instance,
            f"Marked attendance for {employee.username} on {serializer.instance.date}"
        )
        return api_response(
            success=True,
            message="Attendance recorded successfully.",
            data=serializer.data,
            status_code=201
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        if not can_manage_attendance_for(request.user, instance.employee):
            return api_response(
                success=False,
                message="Operation failed.",
                errors={"detail": "You don't have permission to edit this record."},
                status_code=403
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(marked_by=request.user)
        log_action(
            request, AuditLog.ActionType.UPDATE, serializer.instance,
            f"Updated attendance for {instance.employee.username} on {instance.date}"
        )
        return api_response(
            success=True,
            message="Attendance updated successfully.",
            data=serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if not can_manage_attendance_for(request.user, instance.employee):
            return api_response(
                success=False,
                message="Operation failed.",
                errors={"detail": "You don't have permission to delete this record."},
                status_code=403
            )

        log_action(
            request, AuditLog.ActionType.DELETE, instance,
            f"Deleted attendance for {instance.employee.username} on {instance.date}"
        )
        instance.delete()
        return api_response(
            success=True,
            message="Attendance record deleted successfully.",
            data=None
        )