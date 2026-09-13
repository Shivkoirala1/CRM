from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from crm.utils import api_response
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from audit.models import AuditLog
from audit.signals import get_client_ip


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return api_response(
        success=True,
        message="User retrieved successfully.",
        data=serializer.data,
        status_code=200
    )

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        request = self.context.get('request')
        AuditLog.objects.create(
            user=self.user,
            action=AuditLog.ActionType.LOGIN,
            description=f"{self.user.username} logged in.",
            ip_address=get_client_ip(request) if request else None
        )
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
