from django.db import models
from accounts.models import User


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        HALF_DAY = 'HALF_DAY', 'Half Day'
        LEAVE = 'LEAVE', 'Leave'
        HOLIDAY = 'HOLIDAY', 'Holiday'

    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)
    check_in = models.TimeField(blank=True, null=True)
    check_out = models.TimeField(blank=True, null=True)
    notes = models.CharField(max_length=255, blank=True, null=True)

    marked_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendance_marked'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.username} — {self.date} — {self.status}"