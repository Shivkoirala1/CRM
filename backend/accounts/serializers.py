from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'supervisor', 'supervisor_name']