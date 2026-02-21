from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta, date
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_date

from .models import (
    Client,
    VehicleInsurance,
    HealthInsurance,
    Quote,
    Note,
    Document,
    LeadConversion
)
from .serializers import (
    ClientSerializer,
    VehicleInsuranceSerializer,
    HealthInsuranceSerializer,
    QuoteSerializer,
    NoteSerializer,
    DocumentSerializer,
    ClientDetailSerializer,
    LeadConversionSerializer
)


# ----------------------------- CLIENT -----------------------------
class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        insurance_type = self.request.query_params.get("insurance_type")
        if insurance_type:
            qs = qs.filter(insurance_type=insurance_type)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClientDetailSerializer
        return ClientSerializer

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        client = self.get_object()
        notes = client.notes.order_by('-follow_up_date')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)


# ----------------------------- VEHICLE & HEALTH -----------------------------
class VehicleInsuranceViewSet(viewsets.ModelViewSet):
    queryset = VehicleInsurance.objects.all()
    serializer_class = VehicleInsuranceSerializer


class HealthInsuranceViewSet(viewsets.ModelViewSet):
    queryset = HealthInsurance.objects.all()
    serializer_class = HealthInsuranceSerializer


# ----------------------------- QUOTES -----------------------------
class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer


# ----------------------------- NOTES -----------------------------
class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('follow_up_date')
    serializer_class = NoteSerializer

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = now().date()
        notes = self.queryset.filter(follow_up_date=today, reminder=True, completed=False)
        return Response(self.get_serializer(notes, many=True).data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        today = now().date()
        notes = self.queryset.filter(follow_up_date__lt=today, reminder=True, completed=False)
        return Response(self.get_serializer(notes, many=True).data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        today = now().date()
        next_week = today + timedelta(days=30)
        notes = self.queryset.filter(
            follow_up_date__gt=today,
            follow_up_date__lte=next_week,
            reminder=True,
            completed=False
        )
        return Response(self.get_serializer(notes, many=True).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        note = self.get_object()
        note.completed = True
        note.save()
        return Response({'status': 'completed'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        today = now().date()
        return Response({
            "today": self.queryset.filter(follow_up_date=today, reminder=True).count(),
            "overdue": self.queryset.filter(follow_up_date__lt=today, reminder=True).count(),
            "upcoming": self.queryset.filter(
                follow_up_date__gt=today,
                follow_up_date__lte=today + timedelta(days=7),
                reminder=True
            ).count()
        })


# ----------------------------- DOCUMENTS -----------------------------

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by("-uploaded_at")  # ✅ add this back
    serializer_class = DocumentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        client_id = self.request.query_params.get("client")
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs




@csrf_exempt
def delete_document(request, pk):
    if request.method == 'DELETE':
        doc = get_object_or_404(Document, pk=pk)
        doc.file.delete(save=False)
        doc.delete()
        return JsonResponse({'success': True})


# ----------------------------- LEAD CONVERSION -----------------------------
@api_view(["POST"])
def convert_client(request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)

    data = request.data
    data["client"] = client.id

    serializer = LeadConversionSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        client.is_converted = True
        client.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


# ----------------------------- HEALTH RENEWAL HELPERS -----------------------------
def month_range(yyyy_mm: str):
    """
    Convert 'YYYY-MM' into a tuple (start_date, end_date)
    where start_date is the first day of the month,
    and end_date is the first day of the next month.
    """
    y, m = yyyy_mm.split("-")
    y = int(y)
    m = int(m)

    start = date(y, m, 1)
    if m == 12:
        end = date(y + 1, 1, 1)
    else:
        end = date(y, m + 1, 1)
    return start, end


# ----------------------------- HEALTH RENEWAL APIS -----------------------------
@api_view(["GET"])
def health_renewal_summary(request):
    """
    GET /api/renewals/health/summary/?month=YYYY-MM
    Returns counts for pending/missed/dismissed renewals in that month.
    """
    month = request.query_params.get("month")
    if not month:
        return Response({"error": "month is required (YYYY-MM)"}, status=400)

    start, end = month_range(month)
    today = date.today()

    qs = HealthInsurance.objects.select_related("client").filter(
        renewal_date__gte=start,
        renewal_date__lt=end
    )

    dismissed = qs.filter(renewal_dismissed=True).count()
    pending = qs.filter(renewal_dismissed=False, renewal_date__gte=today).count()
    missed = qs.filter(renewal_dismissed=False, renewal_date__lt=today).count()

    return Response({
        "month": month,
        "pending": pending,
        "missed": missed,
        "dismissed": dismissed,
    })


@api_view(["GET"])
def health_renewal_list(request):
    """
    GET /api/renewals/health/?month=YYYY-MM&status=pending|missed|dismissed
    Returns detailed list of health insurance renewals for the given month and status.
    """
    month = request.query_params.get("month")
    status_key = request.query_params.get("status", "pending")

    if not month:
        return Response({"error": "month is required (YYYY-MM)"}, status=400)

    start, end = month_range(month)
    today = date.today()

    qs = HealthInsurance.objects.select_related("client").filter(
        renewal_date__gte=start,
        renewal_date__lt=end
    )

    if status_key == "dismissed":
        qs = qs.filter(renewal_dismissed=True)
    elif status_key == "missed":
        qs = qs.filter(renewal_dismissed=False, renewal_date__lt=today)
    else:  # default: pending
        qs = qs.filter(renewal_dismissed=False, renewal_date__gte=today)

    data = []
    for h in qs.order_by("renewal_date"):
        data.append({
            "id": h.id,
            "renewal_date": h.renewal_date,
            "renewal_dismissed": h.renewal_dismissed,
            "floater_type": h.floater_type,
            "ages": h.ages,
            "ped": h.ped,
            "client": {
                "id": h.client.id,
                "name": h.client.name,
                "mobile": h.client.mobile,
                "place": h.client.place,
                "insurance_type": h.client.insurance_type,
            }
        })

    return Response(data)


@api_view(["POST"])
def health_renew(request, client_id):
    """
    POST /api/renewals/health/<client_id>/renew/
    Body: { "next_renewal_date": "YYYY-MM-DD" }
    Renews a health insurance policy by updating the renewal_date and clearing dismissal.
    """
    next_date = request.data.get("next_renewal_date")
    parsed = parse_date(next_date) if next_date else None
    if not parsed:
        return Response({"error": "next_renewal_date is required (YYYY-MM-DD)"}, status=400)

    h = HealthInsurance.objects.select_related("client").filter(client_id=client_id).first()
    if not h:
        return Response({"error": "HealthInsurance not found for this client"}, status=404)

    h.renewal_date = parsed
    h.renewal_dismissed = False
    h.save()

    return Response({
        "success": True,
        "client_id": client_id,
        "next_renewal_date": str(parsed)
    })

# ----------------------------- VEHICLE RENEWAL APIS -----------------------------
@api_view(["GET"])
def vehicle_renewal_summary(request):
    """
    GET /api/renewals/vehicle/summary/?month=YYYY-MM
    Returns counts for pending/missed renewals in that month.
    """
    month = request.query_params.get("month")
    if not month:
        return Response({"error": "month is required (YYYY-MM)"}, status=400)

    start, end = month_range(month)
    today = date.today()

    qs = VehicleInsurance.objects.select_related("client").filter(
        renewal_date__isnull=False,
        renewal_date__gte=start,
        renewal_date__lt=end
    )

    pending = qs.filter(renewal_date__gte=today).count()
    missed = qs.filter(renewal_date__lt=today).count()

    return Response({
        "month": month,
        "pending": pending,
        "missed": missed,
    })


@api_view(["GET"])
def vehicle_renewal_list(request):
    """
    GET /api/renewals/vehicle/?month=YYYY-MM&status=pending|missed
    """
    month = request.query_params.get("month")
    status_key = request.query_params.get("status", "pending")

    if not month:
        return Response({"error": "month is required (YYYY-MM)"}, status=400)

    start, end = month_range(month)
    today = date.today()

    qs = VehicleInsurance.objects.select_related("client").filter(
        renewal_date__isnull=False,
        renewal_date__gte=start,
        renewal_date__lt=end
    )

    if status_key == "missed":
        qs = qs.filter(renewal_date__lt=today)
    else:
        qs = qs.filter(renewal_date__gte=today)

    data = []
    for v in qs.order_by("renewal_date"):
        data.append({
            "id": v.id,
            "renewal_date": v.renewal_date,
            "vehicle_type": v.vehicle_type,
            "insurance_cover": v.insurance_cover,
            "client": {
                "id": v.client.id,
                "name": v.client.name,
                "mobile": v.client.mobile,
                "place": v.client.place,
                "insurance_type": v.client.insurance_type,
            }
        })

    return Response(data)


@api_view(["POST"])
def vehicle_renew(request, client_id):
    """
    POST /api/renewals/vehicle/<client_id>/renew/
    Body: { "next_renewal_date": "YYYY-MM-DD" }
    """
    next_date = request.data.get("next_renewal_date")
    parsed = parse_date(next_date) if next_date else None
    if not parsed:
        return Response({"error": "next_renewal_date is required (YYYY-MM-DD)"}, status=400)

    v = VehicleInsurance.objects.select_related("client").filter(client_id=client_id).first()
    if not v:
        return Response({"error": "VehicleInsurance not found for this client"}, status=404)

    v.renewal_date = parsed
    v.save()

    return Response({
        "success": True,
        "client_id": client_id,
        "next_renewal_date": str(parsed)
    })

@api_view(["POST"])
def vehicle_set_renewal_date(request, client_id):
    """
    POST /api/renewals/vehicle/<client_id>/set/
    Body: { "renewal_date": "YYYY-MM-DD" }
    """
    renewal_date = request.data.get("renewal_date")
    parsed = parse_date(renewal_date) if renewal_date else None
    if not parsed:
        return Response({"error": "renewal_date is required (YYYY-MM-DD)"}, status=400)

    v = VehicleInsurance.objects.filter(client_id=client_id).first()
    if not v:
        return Response({"error": "VehicleInsurance not found for this client"}, status=404)

    v.renewal_date = parsed
    v.save()

    return Response({"success": True, "client_id": client_id, "renewal_date": str(parsed)})


@api_view(["DELETE"])
def delete_client_full(request, client_id):
    client = get_object_or_404(Client, id=client_id)
    client.delete()  # ✅ CASCADE deletes everything linked
    return Response({"success": True, "message": "Client deleted fully"})