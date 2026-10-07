from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Task
from notifications.models import Notification


@receiver(pre_save, sender=Task)
def stash_previous_task_state(sender, instance, **kwargs):
    """
    Before a Task is saved, remember what it looked like before — this is
    the only reliable way to tell "the assignee just changed" or "the
    status just changed" apart from "this field happened to be saved
    again with the same value." Stored as a private attribute on the
    instance so post_save (right below) can read it.
    """
    if instance.pk:
        try:
            previous = Task.objects.get(pk=instance.pk)
            instance._previous_assigned_to_id = previous.assigned_to_id
            instance._previous_status = previous.status
        except Task.DoesNotExist:
            instance._previous_assigned_to_id = None
            instance._previous_status = None
    else:
        instance._previous_assigned_to_id = None
        instance._previous_status = None


@receiver(post_save, sender=Task)
def notify_on_task_changes(sender, instance, created, **kwargs):
    previous_assigned_to_id = getattr(instance, '_previous_assigned_to_id', None)
    previous_status = getattr(instance, '_previous_status', None)

    # New assignment: either the task was just created with an assignee,
    # or an existing task's assignee actually changed to someone new.
    if instance.assigned_to_id and (created or previous_assigned_to_id != instance.assigned_to_id):
        Notification.objects.create(
            recipient_id=instance.assigned_to_id,
            notification_type=Notification.NotificationType.TASK_ASSIGNED,
            message=f"You've been assigned a task: {instance.title}"
        )

    # Status change on an existing task (never fires on the initial
    # creation, since there's no "previous" status to compare against).
    if not created and previous_status is not None and previous_status != instance.status and instance.assigned_to_id:
        Notification.objects.create(
            recipient_id=instance.assigned_to_id,
            notification_type=Notification.NotificationType.TASK_STATUS_CHANGED,
            message=f"Task \"{instance.title}\" status changed to {instance.get_status_display()}"
        )