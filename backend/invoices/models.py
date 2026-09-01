from django.db import models
from clients.models import Client
from projects.models import Project


class Invoice(models.Model):
    class PaymentStatus(models.TextChoices):
        PAID = 'PAID', 'Paid'
        PENDING = 'PENDING', 'Pending'
        PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'
        OVERDUE = 'OVERDUE', 'Overdue'

    invoice_number = models.CharField(max_length=50, unique=True)
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name='invoices'
    )
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices'
    )

    items_services = models.TextField(help_text="Description of items/services billed")
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    issue_date = models.DateField()
    due_date = models.DateField()

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.client.name}"
