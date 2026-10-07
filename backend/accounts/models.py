from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin/CEO'
        MANAGER = 'MANAGER', 'Manager'
        SUPERVISOR = 'SUPERVISOR', 'Supervisor'
        STAFF = 'STAFF', 'General Staff'
        INTERN = 'INTERN', 'Intern'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF
    )
    phone = models.CharField(max_length=20, blank=True, null=True)

    # Only meaningful for Interns right now (a Supervisor manages the
    # Interns pointing to them), but kept generic in case other roles
    # need a reporting line later.
    supervisor = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='interns'
    )

    # 2FA fields
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.role})"