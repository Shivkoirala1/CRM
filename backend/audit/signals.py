from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import AuditLog


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    AuditLog.objects.create(
        user=user,
        action=AuditLog.ActionType.LOGIN,
        description=f"{user.username} logged in.",
        ip_address=get_client_ip(request)
    )