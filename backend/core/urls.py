from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet,
    VehicleInsuranceViewSet,
    HealthInsuranceViewSet,
    InvestmentDetailsViewSet,           
    QuoteViewSet,
    EMIDetailsViewSet,
    NoteViewSet,
    DocumentViewSet,
    delete_document,
    convert_client,
    convert_investment_client,          
    health_renewal_summary,
    health_renewal_list,
    health_renew,
    delete_client_full,
    vehicle_renew, vehicle_renewal_list,
    vehicle_renewal_summary,
    vehicle_set_renewal_date,
    investment_renewal_summary,         
    investment_renewal_list,            
    investment_renew,                   
    investment_set_renewal_date,      
    debug_db
)

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('vehicle-insurance', VehicleInsuranceViewSet)
router.register('health-insurance', HealthInsuranceViewSet)
router.register('investment-details', InvestmentDetailsViewSet)  
router.register('quotes', QuoteViewSet)
router.register('emi-details', EMIDetailsViewSet)
router.register('notes', NoteViewSet)
router.register('documents', DocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('documents/<int:pk>/delete/', delete_document),
    path("convert-client/<int:client_id>/", convert_client),
    path("convert-investment-client/<int:client_id>/", convert_investment_client),  

    path("renewals/health/summary/", health_renewal_summary),
    path("renewals/health/", health_renewal_list),
    path("renewals/health/<int:client_id>/renew/", health_renew),

    path("renewals/vehicle/summary/", vehicle_renewal_summary),
    path("renewals/vehicle/", vehicle_renewal_list),
    path("renewals/vehicle/<int:client_id>/renew/", vehicle_renew),
    path("renewals/vehicle/<int:client_id>/set/", vehicle_set_renewal_date),

    
    path("renewals/investment/summary/", investment_renewal_summary),
    path("renewals/investment/", investment_renewal_list),
    path("renewals/investment/<int:client_id>/renew/", investment_renew),
    path("renewals/investment/<int:client_id>/set/", investment_set_renewal_date),

    path("clients/<int:client_id>/full-delete/", delete_client_full),
    path("debug-db/", debug_db),
]