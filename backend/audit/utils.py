from .models import AuditLog


def log_action(request, action, instance, description):
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0] or request.META.get('REMOTE_ADDR')
    AuditLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        description=description,
        ip_address=ip
    )