from django.contrib import admin
from .models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'amount', 'payment_status', 'issue_date', 'due_date', 'is_archived']
    list_filter = ['payment_status', 'is_archived']
    search_fields = ['invoice_number', 'client__name']
