from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'assigned_to', 'priority', 'status', 'due_date', 'is_recurring']
    list_filter = ['priority', 'status', 'is_recurring']
    search_filter = ['title']
