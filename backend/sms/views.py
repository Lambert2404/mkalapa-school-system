from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import SMSMessage
from .serializers import SMSMessageSerializer
from .services import sms_service
from contributions.models import Contribution
from students.models import Student
from settings_app.models import SystemSettings


class SMSMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/sms/ — SMS history with filters (student, status, type)."""
    queryset = SMSMessage.objects.select_related("student").all()
    serializer_class = SMSMessageSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "message_type", "student"]
    search_fields = ["student__full_name", "phone", "message"]
    ordering_fields = ["created_at", "sent_at"]


class SendSingleSMSView(APIView):
    """
    POST /api/sms/send/
    Body: { "contribution_id": <id> }   -> auto-generated debt/completion SMS
       OR { "student_id": <id>, "message": "..." }  -> custom SMS
    """

    def post(self, request):
        school = SystemSettings.get_solo()

        contribution_id = request.data.get("contribution_id")
        if contribution_id:
            try:
                contribution = Contribution.objects.select_related("student").get(pk=contribution_id)
            except Contribution.DoesNotExist:
                return Response({"error": "Contribution not found."}, status=status.HTTP_404_NOT_FOUND)

            if contribution.status == "COMPLETED":
                message = sms_service.generate_completion_sms(contribution, school.school_name)
                m_type = "COMPLETION"
            else:
                message = sms_service.generate_debt_sms(contribution, school.school_name)
                m_type = "DEBT_REMINDER"

            record = sms_service.send_sms(
                contribution.student, contribution.student.guardian_phone, message, m_type, contribution
            )
            return Response(SMSMessageSerializer(record).data, status=status.HTTP_201_CREATED)

        student_id = request.data.get("student_id")
        message = request.data.get("message")
        if not student_id or not message:
            return Response(
                {"error": "Provide either contribution_id, or student_id and message."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        record = sms_service.send_sms(student, student.guardian_phone, message, "CUSTOM")
        return Response(SMSMessageSerializer(record).data, status=status.HTTP_201_CREATED)


class SendBulkSMSView(APIView):
    """
    POST /api/sms/send-bulk/
    Body: { "contribution_ids": [1,2,3] }  -> send to selected debt records
       OR { "send_to_all_debtors": true, "month": "SEPTEMBER", "year": 2026 }
    """

    def post(self, request):
        school = SystemSettings.get_solo()

        if request.data.get("send_to_all_debtors"):
            qs = Contribution.objects.select_related("student").filter(status="HAS_DEBT")
            month = request.data.get("month")
            year = request.data.get("year")
            if month:
                qs = qs.filter(month=month)
            if year:
                qs = qs.filter(year=year)
        else:
            ids = request.data.get("contribution_ids", [])
            qs = Contribution.objects.select_related("student").filter(pk__in=ids)

        if not qs.exists():
            return Response({"error": "No matching contribution records found."},
                             status=status.HTTP_400_BAD_REQUEST)

        summary = sms_service.send_bulk_sms(qs, school_name=school.school_name)
        return Response({
            "total": summary["total"],
            "sent": summary["sent"],
            "failed": summary["failed"],
            "messages": SMSMessageSerializer(summary["messages"], many=True).data,
        }, status=status.HTTP_201_CREATED)


class PreviewSMSView(APIView):
    """
    POST /api/sms/preview/
    Body: { "contribution_ids": [1,2,3] }
    Returns recipient count + a sample preview message, used by the
    confirmation modal before actually sending.
    """

    def post(self, request):
        school = SystemSettings.get_solo()
        ids = request.data.get("contribution_ids", [])
        qs = Contribution.objects.select_related("student").filter(pk__in=ids)

        if not qs.exists():
            return Response({"error": "No matching records."}, status=status.HTTP_400_BAD_REQUEST)

        sample = qs.first()
        if sample.status == "COMPLETED":
            preview = sms_service.generate_completion_sms(sample, school.school_name)
        else:
            preview = sms_service.generate_debt_sms(sample, school.school_name)

        return Response({
            "recipient_count": qs.count(),
            "sms_count": qs.count(),
            "preview_message": preview,
        })
