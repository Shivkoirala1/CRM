from rest_framework import serializers
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.username', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'date', 'status',
            'check_in', 'check_out', 'notes',
            'marked_by', 'marked_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'marked_by', 'created_at', 'updated_at']