from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Contribution
from .serializers import SpreadsheetRowSerializer


class DebtListView(generics.ListAPIView):
    """
    GET /api/debts/  -> all contribution records that currently HAVE a debt.
    Supports the same filters as the /debts page: month, year, class, stream,
    debt type, sms status.
    """
    serializer_class = SpreadsheetRowSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["month", "year", "sms_status"]
    search_fields = ["student__full_name", "student__student_id"]
    ordering_fields = ["cash_debt", "mahindi_debt", "mboga_debt", "year"]

    def get_queryset(self):
        qs = Contribution.objects.select_related("student").filter(status="HAS_DEBT")

        class_name = self.request.query_params.get("class_name")
        stream = self.request.query_params.get("stream")
        debt_type = self.request.query_params.get("debt_type")  # mahindi|mboga|cash

        if class_name:
            qs = qs.filter(student__class_name=class_name)
        if stream:
            qs = qs.filter(student__stream=stream)
        if debt_type == "mahindi":
            qs = qs.filter(mahindi_debt__gt=0)
        elif debt_type == "mboga":
            qs = qs.filter(mboga_debt__gt=0)
        elif debt_type == "cash":
            qs = qs.filter(cash_debt__gt=0)

        return qs


class StudentDebtDetailView(APIView):
    """GET /api/debts/:student_id/ -> all debt records for one student."""

    def get(self, request, student_id):
        qs = Contribution.objects.select_related("student").filter(
            student_id=student_id, status="HAS_DEBT"
        )
        return Response(SpreadsheetRowSerializer(qs, many=True).data)
