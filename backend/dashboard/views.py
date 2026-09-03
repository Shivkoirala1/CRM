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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_report(request):
    by_service = (
        Invoice.objects.filter(is_archived=False, payment_status=Invoice.PaymentStatus.PAID)
        .values('project__service')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )

    by_lead_source = (
        Lead.objects.filter(is_archived=False, status=Lead.LeadStatus.CONVERTED)
        .values('lead_source')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    by_team_member = (
        Invoice.objects.filter(is_archived=False, payment_status=Invoice.PaymentStatus.PAID)
        .values('project__assigned_employees__username')
        .annotate(total=Sum('amount'))
        .order_by('-total')
    )

    data = {
        "by_service": list(by_service),
        "by_lead_source": list(by_lead_source),
        "by_team_member": list(by_team_member),
    }

    return api_response(
        success=True,
        message="Revenue report retrieved successfully.",
        data=data
    )
