from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from crm.utils import api_response
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from audit.models import AuditLog
from audit.signals import get_client_ip
from .models import User

import pyotp
import qrcode
import io
import base64
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from crm.utils import api_response
from .models import User

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


#2FA 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    user = request.user

    if not user.otp_secret:
        user.otp_secret = pyotp.random_base32()
        user.save()

    totp = pyotp.TOTP(user.otp_secret)
    provisioning_uri = totp.provisioning_uri(name=user.email or user.username, issuer_name="CRM System")

    qr = qrcode.make(provisioning_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return api_response(
        success=True,
        message="Scan this QR code with your authenticator app, then verify to activate 2FA.",
        data={
            "qr_code_base64": qr_base64,
            "manual_entry_key": user.otp_secret
        }
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa_setup(request):
    user = request.user
    code = request.data.get('code')

    if not user.otp_secret:
        return api_response(
            success=False,
            message="2FA setup not started.",
            errors={"detail": "Call enable-2fa first to generate a secret."},
            status_code=400
        )

    totp = pyotp.TOTP(user.otp_secret)
    if totp.verify(code):
        user.is_2fa_enabled = True
        user.save()
        return api_response(
            success=True,
            message="2FA has been successfully enabled.",
            data={"is_2fa_enabled": True}
        )
    else:
        return api_response(
            success=False,
            message="Invalid code.",
            errors={"code": "The code entered is incorrect or expired."},
            status_code=400
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')

    if not current_password or not new_password:
        return api_response(
            success=False,
            message="Both current_password and new_password are required.",
            errors={"detail": "Missing field(s)."},
            status_code=400,
        )

    if len(new_password) < 8:
        return api_response(
            success=False,
            message="New password must be at least 8 characters.",
            errors={"new_password": ["Too short."]},
            status_code=400,
        )

    if not request.user.check_password(current_password):
        return api_response(
            success=False,
            message="Current password is incorrect.",
            errors={"current_password": ["Incorrect."]},
            status_code=400,
        )

    request.user.set_password(new_password)
    request.user.save()
    return api_response(
        success=True,
        message="Password updated successfully.",
        data=None,
        status_code=200,
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    serializer = UserSerializer(User.objects.all().order_by('username'), many=True)
    return api_response(
        success=True,
        message="Users retrieved successfully.",
        data=serializer.data,
        status_code=200
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')

    if not current_password or not new_password:
        return api_response(
            success=False,
            message="Both current_password and new_password are required.",
            errors={"detail": "Missing field(s)."},
            status_code=400,
        )

    if len(new_password) < 8:
        return api_response(
            success=False,
            message="New password must be at least 8 characters.",
            errors={"new_password": ["Too short."]},
            status_code=400,
        )

    if not request.user.check_password(current_password):
        return api_response(
            success=False,
            message="Current password is incorrect.",
            errors={"current_password": ["Incorrect."]},
            status_code=400,
        )

    request.user.set_password(new_password)
    request.user.save()
    return api_response(
        success=True,
        message="Password updated successfully.",
        data=None,
        status_code=200,
    )