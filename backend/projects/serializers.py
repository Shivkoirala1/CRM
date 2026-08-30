from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    assigned_employees_names = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'client', 'client_name', 'service',
            'description', 'scope_of_work',
            'start_date', 'deadline', 'status',
            'assigned_employees', 'assigned_employees_names',
            'is_archived', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assigned_employees_names(self, obj):
        return [user.username for user in obj.assigned_employees.all()]