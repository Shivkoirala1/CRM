from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'company_name', 'email', 'phone', 'payment_status', 'renewal_date', 'is_archived', 'created_at']
    list_filter = ['payment_status', 'is_archived']
    search_fields = ['name', 'email', 'phone', 'company_name']