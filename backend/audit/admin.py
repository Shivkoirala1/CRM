from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [ 'user','action','model_name', 'description', 'ip_address', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__name', 'description']
    readonly_fields = ['user', 'action','model_name', 'object_id', 'description', 'ip_address', 'timestamp']