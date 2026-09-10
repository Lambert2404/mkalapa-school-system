from rest_framework import serializers
from .models import Contribution
from students.serializers import StudentMiniSerializer
from students.models import Student


class ContributionSerializer(serializers.ModelSerializer):
    student_detail = StudentMiniSerializer(source="student", read_only=True)
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())

    class Meta:
        model = Contribution
        fields = [
            "id", "student", "student_detail", "month", "year",
            "mahindi_required", "mahindi_submitted", "mahindi_debt",
            "mboga_required", "mboga_submitted", "mboga_debt",
            "cash_required", "cash_submitted", "cash_debt",
            "status", "sms_status", "recorded_date", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "mahindi_debt", "mboga_debt", "cash_debt", "status",
        ]

    def validate(self, attrs):
        student = attrs.get("student") or getattr(self.instance, "student", None)
        month = attrs.get("month") or getattr(self.instance, "month", None)
        year = attrs.get("year") or getattr(self.instance, "year", None)

        qs = Contribution.objects.filter(student=student, month=month, year=year)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "This student already has a contribution record for this month."
            )

        for field in ["mahindi_submitted", "mboga_submitted", "cash_submitted"]:
            if field in attrs and attrs[field] is not None and attrs[field] < 0:
                raise serializers.ValidationError({field: f"{field} cannot be negative."})

        return attrs

    def create(self, validated_data):
        # Snapshot current SystemSettings requirements if not explicitly provided.
        from settings_app.models import SystemSettings
        settings_obj = SystemSettings.get_solo()
        validated_data.setdefault("mahindi_required", settings_obj.mahindi_requirement)
        validated_data.setdefault("mboga_required", settings_obj.mboga_requirement)
        validated_data.setdefault("cash_required", settings_obj.cash_requirement)
        return super().create(validated_data)


class SpreadsheetRowSerializer(serializers.ModelSerializer):
    """
    Flattened representation used by the embedded spreadsheet grid, matching
    the 22-column layout described in the spec.
    """
    student_id = serializers.CharField(source="student.student_id", read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    class_name = serializers.CharField(source="student.class_name", read_only=True)
    stream = serializers.CharField(source="student.stream", read_only=True)
    guardian_name = serializers.CharField(source="student.guardian_name", read_only=True)
    guardian_phone = serializers.CharField(source="student.guardian_phone", read_only=True)
    total_debt_display = serializers.SerializerMethodField()

    class Meta:
        model = Contribution
        fields = [
            "id", "student", "student_id", "student_name", "class_name", "stream",
            "guardian_name", "guardian_phone", "month", "year",
            "mahindi_required", "mahindi_submitted", "mahindi_debt",
            "mboga_required", "mboga_submitted", "mboga_debt",
            "cash_required", "cash_submitted", "cash_debt",
            "total_debt_display", "status", "sms_status", "recorded_date", "notes",
        ]

    def get_total_debt_display(self, obj):
        parts = []
        if obj.mahindi_debt and obj.mahindi_debt > 0:
            parts.append(f"Mahindi {obj.mahindi_debt} KG")
        if obj.mboga_debt and obj.mboga_debt > 0:
            parts.append(f"Mboga {obj.mboga_debt} KG")
        if obj.cash_debt and obj.cash_debt > 0:
            parts.append(f"TSh {obj.cash_debt}")
        return ", ".join(parts) if parts else "None"
