from rest_framework import serializers
from .models import SMSMessage
from students.serializers import StudentMiniSerializer


class SMSMessageSerializer(serializers.ModelSerializer):
    student_detail = StudentMiniSerializer(source="student", read_only=True)

    class Meta:
        model = SMSMessage
        fields = [
            "id", "student", "student_detail", "phone", "message", "message_type",
            "status", "provider", "provider_message_id", "gateway_response",
            "error_message", "sent_at", "created_at",
        ]
