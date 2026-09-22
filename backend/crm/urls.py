from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView, me, enable_2fa, verify_2fa_setup, list_users, change_password
from leads.views import LeadViewSet
from clients.views import ClientViewSet
from projects.views import ProjectViewSet
from tasks.views import TaskViewSet
from invoices.views import InvoiceViewSet, client_payment_history
from dashboard.views import dashboard_stats, revenue_report, export_leads_excel, export_leads_pdf, global_search
from notifications.views import NotificationViewSet
from audit.views import AuditLogViewSet

router = DefaultRouter()
router.register('leads', LeadViewSet, basename='lead')
router.register('clients', ClientViewSet, basename='client')
router.register('projects', ProjectViewSet, basename='project')
router.register('tasks', TaskViewSet, basename='task')
router.register('invoices', InvoiceViewSet, basename='invoice')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', me, name='me'),
    path('api/users/', list_users, name='list-users'),
    path('api/me/change-password/', change_password, name='change-password'),
    path('api/clients/<int:client_id>/payment-history/', client_payment_history, name='client-payment'),
    path('api/', include(router.urls)),
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('api/dashboard/revenue/', revenue_report, name='dashboard-revenue'),
    path('api/dashboard/export/leads/excel/', export_leads_excel, name='export-leads-excel'),
    path('api/dashboard/export/leads/pdf/', export_leads_pdf, name='export-leads-pdf'),
    path('api/search/', global_search, name='global-search'),
    path('api/2fa/enable/', enable_2fa, name='enable-2fa'),
    path('api/2fa/verify-setup/', verify_2fa_setup, name='verify-2fa-setup'),
]