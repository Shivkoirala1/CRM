from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead
from notifications.models import Notification


@receiver(post_save, sender=Lead)
def notify_on_lead_assignment(sender, instance, created, **kwargs):
    if instance.assigned_employee:
        Notification.objects.create(
            recipient=instance.assigned_employee,
            notification_type=Notification.NotificationType.LEAD_ASSIGNED,
            message=f"You've been assigned a new lead: {instance.name}"
        )