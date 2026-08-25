from django.db import models
from accounts.models import User


class Lead(models.Model):
    class LeadSource(models.TextChoices):
        FACEBOOK_ADS = 'FACEBOOK_ADS', 'Facebook Ads'
        INSTAGRAM_ADS = 'INSTAGRAM_ADS', 'Instagram Ads'
        WEBSITE = 'WEBSITE', 'Website'
        REFERRAL = 'REFERRAL', 'Referral'
        WALK_IN = 'WALK_IN', 'Walk-in'
        OTHER = 'OTHER', 'Other'

    class LeadStatus(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        QUALIFIED = 'QUALIFIED', 'Qualified'
        CONVERTED = 'CONVERTED', 'Converted'
        LOST = 'LOST', 'Lost'

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    service_interested_in = models.CharField(max_length=255, blank=True, null=True)
    budget_range = models.CharField(max_length=100, blank=True, null=True)

    lead_source = models.CharField(
        max_length=20,
        choices=LeadSource.choices,
        default=LeadSource.OTHER
    )
    status = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW
    )

    assigned_employee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads'
    )
    notes = models.TextField(blank=True, null=True)

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.status})"