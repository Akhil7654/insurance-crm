from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet,
    VehicleInsuranceViewSet,
    HealthInsuranceViewSet,
    QuoteViewSet,
    NoteViewSet,
    DocumentViewSet,
    delete_document,
    convert_client,
    health_renewal_summary,
    health_renewal_list,
    health_renew,
    delete_client_full,
    vehicle_renew,vehicle_renewal_list,
    vehicle_renewal_summary,
    vehicle_set_renewal_date
)

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('vehicle-insurance', VehicleInsuranceViewSet)
router.register('health-insurance', HealthInsuranceViewSet)
router.register('quotes', QuoteViewSet)
router.register('notes', NoteViewSet)
router.register('documents', DocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('documents/<int:pk>/delete/', delete_document),
    path("convert-client/<int:client_id>/", convert_client),

    path("renewals/health/summary/", health_renewal_summary),
    path("renewals/health/", health_renewal_list),
    path("renewals/health/<int:client_id>/renew/", health_renew),

    path("renewals/vehicle/summary/", vehicle_renewal_summary),
    path("renewals/vehicle/", vehicle_renewal_list),
    path("renewals/vehicle/<int:client_id>/renew/", vehicle_renew),
    path("renewals/vehicle/<int:client_id>/set/", vehicle_set_renewal_date),


    path("clients/<int:client_id>/full-delete/", delete_client_full),
]