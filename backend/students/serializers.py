from rest_framework import serializers
from .models import Student, normalize_tz_phone


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "id", "student_id", "full_name", "gender", "date_of_birth",
            "class_name", "stream", "guardian_name", "guardian_phone",
            "alternative_phone", "address", "status",
            "created_at", "updated_at",
        ]

    def validate_guardian_phone(self, value):
        return normalize_tz_phone(value)

    def validate_alternative_phone(self, value):
        if not value:
            return value
        return normalize_tz_phone(value)


class StudentMiniSerializer(serializers.ModelSerializer):
    """Lightweight representation used in nested contexts (contributions, SMS, debts)."""
    class Meta:
        model = Student
        fields = ["id", "student_id", "full_name", "class_name", "stream",
                   "guardian_name", "guardian_phone"]
