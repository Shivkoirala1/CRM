from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin/CEO'
        MANAGER = 'MANAGER', 'Manager'
        STAFF = 'STAFF', 'General Staff'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF
    )
    phone=models.CharField(max_length=20, blank=True, null=True)

    # 2FA fields
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} (self{self.role})"