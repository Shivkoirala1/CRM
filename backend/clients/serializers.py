from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    assigned_employee_name = serializers.CharField(
        source='assigned_employee.username', read_only=True
    )

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'company_name', 'services',
            'payment_status', 'renewal_date',
            'assigned_employee', 'assigned_employee_name',
            'notes', 'is_archived', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']