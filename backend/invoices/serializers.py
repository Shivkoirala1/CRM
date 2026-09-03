from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number',
            'client', 'client_name',
            'project', 'project_name',
            'items_services', 'amount',
            'issue_date', 'due_date',
            'payment_status',
            'is_archived', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']