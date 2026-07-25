from django.contrib import admin

from .models import (
    Client,
    VehicleInsurance,
    HealthInsurance,
    InvestmentDetails,      
    InvestmentConversion,    
    Quote,
    Note,
    Document
)

admin.site.register(Client)
admin.site.register(VehicleInsurance)
admin.site.register(HealthInsurance)
admin.site.register(InvestmentDetails)       
admin.site.register(InvestmentConversion)    
admin.site.register(Quote)
admin.site.register(Note)
admin.site.register(Document)