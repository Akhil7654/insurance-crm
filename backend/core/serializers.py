from rest_framework import serializers

from .models import (
    Client,
    VehicleInsurance,
    HealthInsurance,
    Quote,
    Note,
    Document,
    LeadConversion
)


class VehicleInsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleInsurance
        fields = '__all__'


class HealthInsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthInsurance
        fields = '__all__'


# ✅ UPDATED: include vehicle_details + health_details in list serializer too
class ClientSerializer(serializers.ModelSerializer):
    vehicle_details = VehicleInsuranceSerializer(read_only=True)
    health_details = HealthInsuranceSerializer(read_only=True)

    class Meta:
        model = Client
        fields = [
            'id',
            'name',
            'mobile',
            'place',
            'insurance_type',
            'created_at',
            'is_converted',
            'vehicle_details',
            'health_details',
        ]


class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = '__all__'


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'


class LeadConversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadConversion
        fields = "__all__"


class ClientDetailSerializer(serializers.ModelSerializer):
    vehicle_details = VehicleInsuranceSerializer(read_only=True)
    health_details = HealthInsuranceSerializer(read_only=True)
    quotes = QuoteSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    conversions = LeadConversionSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = [
            'id',
            'name',
            'mobile',
            'place',
            'insurance_type',
            'created_at',
            'is_converted',
            'vehicle_details',
            'health_details',
            'quotes',
            'notes',
            'documents',
            'conversions'
        ]
