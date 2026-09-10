from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Student
from .serializers import StudentSerializer
from contributions.models import Contribution
from contributions.serializers import ContributionSerializer
from sms.models import SMSMessage
from sms.serializers import SMSMessageSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["class_name", "stream", "gender", "status"]
    search_fields = ["student_id", "full_name", "guardian_name", "guardian_phone"]
    ordering_fields = ["full_name", "created_at", "class_name"]

    @action(detail=True, methods=["get"])
    def profile(self, request, pk=None):
        """
        Full student profile: student info + contribution history + current
        debt + SMS history. Used by /students/:id page.
        """
        student = self.get_object()
        contributions = Contribution.objects.filter(student=student).order_by("-year", "-month")
        sms_history = SMSMessage.objects.filter(student=student).order_by("-created_at")

        latest = contributions.first()
        current_debt = None
        if latest:
            current_debt = {
                "month": latest.month,
                "year": latest.year,
                "mahindi_debt": latest.mahindi_debt,
                "mboga_debt": latest.mboga_debt,
                "cash_debt": latest.cash_debt,
                "status": latest.status,
            }

        return Response({
            "student": StudentSerializer(student).data,
            "contributions": ContributionSerializer(contributions, many=True).data,
            "current_debt": current_debt,
            "sms_history": SMSMessageSerializer(sms_history, many=True).data,
        })
