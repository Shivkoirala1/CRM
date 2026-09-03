from django.db import models
from accounts.models import User
from clients.models import Client


class Project(models.Model):
    class ProjectStatus(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', 'Not Started'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        ON_HOLD = 'ON_HOLD', 'On Hold'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    name = models.CharField(max_length=255)
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    service = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    scope_of_work = models.TextField(blank=True, null=True)

    start_date = models.DateField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.NOT_STARTED
    )

    assigned_employees = models.ManyToManyField(
        User,
        blank=True,
        related_name='assigned_projects'
    )

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.client.name})"