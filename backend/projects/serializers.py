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

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Project name must be at least 2 characters.")
        return value

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        deadline = attrs.get('deadline', getattr(self.instance, 'deadline', None))
        if start and deadline and deadline < start:
            raise serializers.ValidationError(
                {"deadline": ["Deadline cannot be before the start date."]}
            )
        return attrs