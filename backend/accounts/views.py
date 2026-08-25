from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from crm.utils import api_response
from .serializers import UserSerializer


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

