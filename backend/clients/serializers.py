import re
from rest_framework import serializers
from .models import Client

PHONE_RE = re.compile(r'^[0-9+\-\s()]{7,20}$')


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

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value

    def validate_phone(self, value):
        if value and not PHONE_RE.match(value):
            raise serializers.ValidationError(
                "Enter a valid phone number (digits, spaces, +, -, ( ) only, 7–20 characters)."
            )
        return value

    def validate(self, attrs):
        phone = attrs.get('phone', getattr(self.instance, 'phone', None))
        email = attrs.get('email', getattr(self.instance, 'email', None))
        if not phone and not email:
            raise serializers.ValidationError(
                {"non_field_errors": ["Provide at least a phone number or an email address."]}
            )
        return attrs