from django.db import models


class Client(models.Model):
    INSURANCE_TYPE_CHOICES = (
        ('vehicle', 'Vehicle'),
        ('health', 'Health'),
    )

    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15)
    place = models.CharField(max_length=100, blank=True)
    insurance_type = models.CharField(max_length=10, choices=INSURANCE_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_converted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.insurance_type}"


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

    renewal_date = models.DateField(null=True, blank=True)

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

    renewal_date = models.DateField(null=True, blank=True)
    renewal_dismissed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.client.name} - Health ({self.floater_type})"



class Quote(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='quotes')
    company_name = models.CharField(max_length=100)
    premium_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} - {self.premium_amount}"


class Note(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='notes')
    text = models.TextField()
    follow_up_date = models.DateField()
    reminder = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Note for {self.client.name}"


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
