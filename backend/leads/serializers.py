from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    assigned_employee_name = serializers.CharField(
        source='assigned_employee.username', read_only=True
    )

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'phone', 'email', 'company', 'address',
            'service_interested_in', 'budget_range',
            'lead_source', 'status',
            'assigned_employee', 'assigned_employee_name',
            'notes', 'is_archived', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']