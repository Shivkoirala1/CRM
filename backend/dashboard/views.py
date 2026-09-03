from django.shortcuts import render
from django.db.models import Count, Sum, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from crm.utils import api_response

from leads.models import Lead
from invoices.models import Invoice


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    #Lead statistics 
    total_leads = Lead.objects.filter(is_archived=False).count()
    new_leads = Lead.objects.filter(is_archived=False, status=Lead.LeadStatus.NEW).count()
    converted_leads = Lead.objects.filter(is_archived=False, status=Lead.LeadStatus.CONVERTED).count()
    lost_leads = Lead.objects.filter(is_archived=False, status=Lead.LeadStatus.LOST).count()

    conversion_rate = round((converted_leads / total_leads) * 100, 2) if total_leads > 0 else 0

    # --- Revenue statistics ---
    total_revenue = Invoice.objects.filter(
        is_archived=False, payment_status=Invoice.PaymentStatus.PAID
    ).aggregate(total=Sum('amount'))['total'] or 0

    pending_revenue = Invoice.objects.filter(
        is_archived=False
    ).exclude(payment_status=Invoice.PaymentStatus.PAID).aggregate(total=Sum('amount'))['total'] or 0

    data = {
        "leads": {
            "total_leads": total_leads,
            "new_leads": new_leads,
            "converted_leads": converted_leads,
            "lost_leads": lost_leads,
            "conversion_rate": conversion_rate,
        },
        "revenue": {
            "total_paid": total_revenue,
            "total_pending": pending_revenue,
        }
    }

    return api_response(
        success=True,
        message="Dashboard statistics retrieved successfully.",
        data=data
    )
