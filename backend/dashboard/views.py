from django.shortcuts import render
from django.db.models import Count, Sum, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from crm.utils import api_response

from leads.models import Lead
from invoices.models import Invoice

from django.http import HttpResponse
from openpyxl import Workbook

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import io

from clients.models import Client
from clients.serializers import ClientSerializer
from leads.models import Lead
from leads.serializers import LeadSerializer
from projects.models import Project
from projects.serializers import ProjectSerializer
from tasks.models import Task
from tasks.serializers import TaskSerializer
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_leads_excel(request):
    leads = Lead.objects.filter(is_archived=False)

    wb = Workbook()
    ws = wb.active
    ws.title = "Leads"

    headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Assigned To', 'Created At']
    ws.append(headers)

    for lead in leads:
        ws.append([
            lead.id,
            lead.name,
            lead.email or '',
            lead.phone or '',
            lead.company or '',
            lead.get_lead_source_display(),
            lead.get_status_display(),
            lead.assigned_employee.username if lead.assigned_employee else '',
            lead.created_at.strftime('%Y-%m-%d %H:%M'),
        ])

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="leads_report.xlsx"'
    wb.save(response)
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_leads_pdf(request):
    leads = Lead.objects.filter(is_archived=False)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()

    elements = [Paragraph("Leads Report", styles['Title'])]

    data = [['ID', 'Name', 'Email', 'Status', 'Source']]
    for lead in leads:
        data.append([
            str(lead.id),
            lead.name,
            lead.email or '',
            lead.get_status_display(),
            lead.get_lead_source_display(),
        ])

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ]))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="leads_report.pdf"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    query = request.query_params.get('q', '').strip()

    if not query:
        return api_response(
            success=False,
            message="Search query is required.",
            errors={"q": "This field is required as a query parameter."},
            status_code=400
        )

    leads = Lead.objects.filter(
        Q(name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query) | Q(company__icontains=query),
        is_archived=False
    )
    clients = Client.objects.filter(
        Q(name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query) | Q(company_name__icontains=query),
        is_archived=False
    )
    projects = Project.objects.filter(
        Q(name__icontains=query) | Q(service__icontains=query),
        is_archived=False
    )
    tasks = Task.objects.filter(
        Q(title__icontains=query) | Q(description__icontains=query)
    )
    invoices = Invoice.objects.filter(
        Q(invoice_number__icontains=query),
        is_archived=False
    )

    data = {
        "leads": LeadSerializer(leads, many=True).data,
        "clients": ClientSerializer(clients, many=True).data,
        "projects": ProjectSerializer(projects, many=True).data,
        "tasks": TaskSerializer(tasks, many=True).data,
        "invoices": InvoiceSerializer(invoices, many=True).data,
    }

    return api_response(
        success=True,
        message=f"Search results for '{query}'.",
        data=data
    )

