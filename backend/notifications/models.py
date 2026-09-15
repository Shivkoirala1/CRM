from django.db import models
from accounts.models import User


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        LEAD_ASSIGNED = 'LEAD_ASSIGNED', 'New Lead Assignment'
        TASK_ASSIGNED = 'TASK_ASSIGNED', 'New Task Assignment'
        TASK_DUE_SOON = 'TASK_DUE_SOON', 'Upcoming Task Deadline'
        TASK_OVERDUE = 'TASK_OVERDUE', 'Overdue Task'
        PAYMENT_DUE = 'PAYMENT_DUE', 'Payment Due'
        PAYMENT_OVERDUE = 'PAYMENT_OVERDUE', 'Overdue Payment'
        RENEWAL_DUE = 'RENEWAL_DUE', 'Upcoming Renewal'
        PROJECT_UPDATE = 'PROJECT_UPDATE', 'Project Update'

    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    message = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notification_type} -> {self.recipient.username}"