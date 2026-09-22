from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Project
from notifications.models import Notification


@receiver(pre_save, sender=Project)
def stash_previous_project_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._previous_status = Project.objects.get(pk=instance.pk).status
        except Project.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None


@receiver(post_save, sender=Project)
def notify_on_project_status_change(sender, instance, created, **kwargs):
    previous_status = getattr(instance, '_previous_status', None)
    if not created and previous_status is not None and previous_status != instance.status:
        for employee in instance.assigned_employees.all():
            Notification.objects.create(
                recipient=employee,
                notification_type=Notification.NotificationType.PROJECT_UPDATE,
                message=f"Project \"{instance.name}\" status changed to {instance.get_status_display()}"
            )