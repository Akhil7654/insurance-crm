from django.db import models


class Client(models.Model):
    INSURANCE_TYPE_CHOICES = (
        ('vehicle', 'Vehicle'),
        ('health', 'Health'),
        ('investment', 'Investment'),
    )

    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15)
    place = models.CharField(max_length=100, blank=True)
    insurance_type = models.CharField(max_length=10, choices=INSURANCE_TYPE_CHOICES,db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_converted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.insurance_type}"


class InvestmentDetails(models.Model):
    client = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name='investment_details'
    )
    investment_type = models.CharField(max_length=200, blank=True, default='')
    remarks = models.TextField(blank=True, default='')

    renewal_date = models.DateField(null=True, blank=True,db_index=True)

    def __str__(self):
        return f"{self.client.name} - Investment"


class InvestmentConversion(models.Model):
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="investment_conversions"
    )

    posp_code = models.CharField(max_length=100)
    company_name = models.CharField(max_length=200)
    investment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    policy_name = models.CharField(max_length=200)
    investment_paying_term = models.CharField(max_length=100)
    renewal_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Investment Conversion - {self.client.name}"


class LeadConversion(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="conversions")

    posp_code = models.CharField(max_length=100)
    customer_name = models.CharField(max_length=100)
    company_name = models.CharField(max_length=200)
    premium_amount = models.DecimalField(max_digits=10, decimal_places=2)
    policy_number = models.CharField(max_length=100)
    customer_mobile = models.CharField(max_length=15)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Converted Lead - {self.client.name}"


class VehicleInsurance(models.Model):
    INSURANCE_COVER_CHOICES = (
        ('full', 'Full'),
        ('third_party', 'Third Party'),
    )

    client = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name='vehicle_details'
    )
    vehicle_type = models.CharField(max_length=50)
    insurance_cover = models.CharField(max_length=20, choices=INSURANCE_COVER_CHOICES)

    renewal_date = models.DateField(null=True, blank=True,db_index=True)

    # ⚠️ Legacy single-EMI fields — kept for backward compatibility with
    # existing data, but the UI now uses the EMIDetails model below
    # (supports multiple EMIs per client with a provider field).
    down_payment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    policy_tenure = models.CharField(max_length=100, blank=True, default='')
    emi_tenure = models.CharField(max_length=100, blank=True, default='')
    monthly_emi_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)

    def __str__(self):
        return f"{self.client.name} - Vehicle"


class HealthInsurance(models.Model):
    FLOATER_CHOICES = (
        ('individual', 'Individual'),
        ('family', 'Family'),
    )

    client = models.OneToOneField(
        "Client",
        on_delete=models.CASCADE,
        related_name='health_details'
    )

    floater_type = models.CharField(max_length=20, choices=FLOATER_CHOICES)
    ages = models.CharField(max_length=100, help_text="Comma separated ages")
    ped = models.TextField(blank=True, help_text="Pre-existing disease details")

    renewal_date = models.DateField(null=True, blank=True,db_index=True)
    renewal_dismissed = models.BooleanField(default=False)

    # ⚠️ Legacy single-EMI fields — kept for backward compatibility with
    # existing data, but the UI now uses the EMIDetails model below
    # (supports multiple EMIs per client with a provider field).
    down_payment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    policy_tenure = models.CharField(max_length=100, blank=True, default='')
    emi_tenure = models.CharField(max_length=100, blank=True, default='')
    monthly_emi_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)

    def __str__(self):
        return f"{self.client.name} - Health ({self.floater_type})"


class EMIDetails(models.Model):
    """
    Multiple EMI plans per client (e.g. a client may have taken more
    than one loan/provider for their policy premium). Works for both
    vehicle and health clients since it's keyed off Client directly.
    """
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='emi_details'
    )

    emi_provider = models.CharField(max_length=200, blank=True, default='')
    emi_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    down_payment = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)
    policy_tenure = models.CharField(max_length=100, blank=True, default='')
    emi_tenure = models.CharField(max_length=100, blank=True, default='')
    monthly_emi_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client.name} - EMI ({self.emi_provider or 'Unnamed'})"


class Quote(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='quotes')
    company_name = models.CharField(max_length=100)
    premium_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} - {self.premium_amount}"


class Note(models.Model):
    PRIORITY_CHOICES = (
        ('HOT', 'HOT'),
        ('WARM', 'WARM'),
        ('COOL', 'COOL'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='notes')
    text = models.TextField()
    follow_up_date = models.DateField()
    reminder = models.BooleanField(default=True)

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='HOT'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['follow_up_date', 'reminder', 'completed']),
        ]

    def __str__(self):
        return f"Note for {self.client.name} - {self.priority}"


class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = (
        ('rc', 'RC'),
        ('aadhaar', 'Aadhaar'),
        ('policy', 'Old Policy'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} - {self.document_type}"