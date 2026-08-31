from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description',
            'lead', 'lead_name',
            'client', 'client_name',
            'project', 'project_name',
            'assigned_to', 'assigned_to_name',
            'due_date', 'priority', 'status',
            'is_recurring', 'recurrence_pattern',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        parents = [data.get('lead'), data.get('client'), data.get('project')]
        linked_count = sum(1 for p in parents if p is not None)

        if linked_count > 1:
            raise serializers.ValidationError(
                "A task can only be linked to one of: lead, client, or project — not multiple."
            )
        return data 