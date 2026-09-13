from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from crm.utils import api_response
from accounts.permissions import IsManagerOrAdmin
from audit.utils import log_action
from audit.models import AuditLog
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.filter(is_archived=False).order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'client']
    search_fields = ['name', 'service', 'description']
    ordering_fields = ['created_at', 'start_date', 'deadline', 'name']

    def get_permissions(self):
        if self.action in ['destroy', 'assign_employees']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(
            success=True,
            message="Projects retrieved successfully.",
            data=serializer.data
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(
            success=True,
            message="Project retrieved successfully.",
            data=serializer.data
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_action(request, AuditLog.ActionType.CREATE, serializer.instance, f"Created project: {serializer.instance.name}")
        return api_response(
            success=True,
            message="Project created successfully.",
            data=serializer.data,
            status_code=201
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_action(request, AuditLog.ActionType.UPDATE, serializer.instance, f"Updated project: {serializer.instance.name}")
        return api_response(
            success=True,
            message="Project updated successfully.",
            data=serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_archived = True
        instance.save()
        log_action(request, AuditLog.ActionType.DELETE, instance, f"Archived project: {instance.name}")
        return api_response(
            success=True,
            message="Project archived successfully.",
            data=None
        )

    @action(detail=True, methods=['post'], url_path='assign-employees')
    def assign_employees(self, request, pk=None):
        project = self.get_object()
        employee_ids = request.data.get('employee_ids', [])
        project.assigned_employees.set(employee_ids)
        log_action(request, AuditLog.ActionType.UPDATE, project, f"Assigned employees to project: {project.name}")
        serializer = self.get_serializer(project)
        return api_response(
            success=True,
            message="Employees assigned successfully.",
            data=serializer.data
        )