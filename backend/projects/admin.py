from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'client', 'status', 'start_date', 'deadline', 'is_archived']
    list_filter = ['status', 'is_archived']
    search_fields = ['name', 'client__name']
    filter_horizontal = ['assigned_employees']