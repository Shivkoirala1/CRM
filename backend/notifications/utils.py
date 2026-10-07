from datetime import timedelta
from django.utils import timezone
from .models import Notification


def notify_once_per_day(recipient, notification_type, message):
    cutoff = timezone.now() - timedelta(hours=20)
    already_sent = Notification.objects.filter(
        recipient=recipient,
        notification_type=notification_type,
        message=message,
        created_at__gte=cutoff,
    ).exists()
    if not already_sent:
        Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            message=message,
        )


def run_reminder_checks():
    from tasks.models import Task
    from invoices.models import Invoice
    from clients.models import Client
    from accounts.models import User

    today = timezone.localdate()
    task_due_soon_by = today + timedelta(days=2)
    invoice_due_soon_by = today + timedelta(days=3)
    renewal_due_soon_by = today + timedelta(days=7)

    managers_and_admins = list(
        User.objects.filter(role__in=[User.Role.MANAGER, User.Role.ADMIN], is_active=True)
    )

    for task in Task.objects.filter(
        due_date__gte=today, due_date__lte=task_due_soon_by
    ).exclude(status=Task.Status.COMPLETED):
        if task.assigned_to:
            notify_once_per_day(
                task.assigned_to,
                Notification.NotificationType.TASK_DUE_SOON,
                f'Task "{task.title}" is due on {task.due_date}.'
            )

    for task in Task.objects.filter(due_date__lt=today).exclude(status=Task.Status.COMPLETED):
        if task.assigned_to:
            notify_once_per_day(
                task.assigned_to,
                Notification.NotificationType.TASK_OVERDUE,
                f'Task "{task.title}" is overdue (was due {task.due_date}).'
            )

    for invoice in Invoice.objects.filter(
        is_archived=False, due_date__gte=today, due_date__lte=invoice_due_soon_by
    ).exclude(payment_status=Invoice.PaymentStatus.PAID):
        for user in managers_and_admins:
            notify_once_per_day(
                user,
                Notification.NotificationType.PAYMENT_DUE,
                f"Invoice {invoice.invoice_number} is due on {invoice.due_date}."
            )

    for invoice in Invoice.objects.filter(
        is_archived=False, due_date__lt=today
    ).exclude(payment_status=Invoice.PaymentStatus.PAID):
        for user in managers_and_admins:
            notify_once_per_day(
                user,
                Notification.NotificationType.PAYMENT_OVERDUE,
                f"Invoice {invoice.invoice_number} is overdue (was due {invoice.due_date})."
            )

    for client in Client.objects.filter(
        is_archived=False, renewal_date__gte=today, renewal_date__lte=renewal_due_soon_by
    ):
        recipients = [client.assigned_employee] if client.assigned_employee else managers_and_admins
        for user in recipients:
            notify_once_per_day(
                user,
                Notification.NotificationType.RENEWAL_DUE,
                f"{client.name}'s renewal is coming up on {client.renewal_date}."
            )