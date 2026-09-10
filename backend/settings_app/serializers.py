from rest_framework import serializers
from .models import SystemSettings, SMSTemplate


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            "school_name", "school_phone", "school_address", "sender_name",
            "mahindi_requirement", "mboga_requirement", "cash_requirement",
            "updated_at",
        ]


class SMSTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSTemplate
        fields = ["id", "name", "template", "type", "active", "created_at", "updated_at"]
