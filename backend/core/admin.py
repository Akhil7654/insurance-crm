from django.contrib import admin

from .models import (
    Client,
    VehicleInsurance,
    HealthInsurance,
    Quote,
    Note,
    Document
)



admin.site.register(Client)
admin.site.register(VehicleInsurance)
admin.site.register(HealthInsurance)
admin.site.register(Quote)
admin.site.register(Note)
admin.site.register(Document)
