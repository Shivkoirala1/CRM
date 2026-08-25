from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_response(success=True, message="", data=None, errors=None, status_code=200):
    return Response({
        "success": success,
        "message": message,
        "data": data,
        "errors": errors
    }, status=status_code)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        response.data = {
            "success": False,
            "message": "Operation failed.",
            "data": None,
            "errors": response.data
        }
    return response