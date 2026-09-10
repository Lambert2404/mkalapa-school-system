from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q

from students.models import Student
from contributions.models import Contribution
from sms.models import SMSMessage
from contributions.serializers import SpreadsheetRowSerializer
from students.serializers import StudentSerializer
from sms.serializers import SMSMessageSerializer


def _apply_common_filters(qs, params):
    month = params.get("month")
    year = params.get("year")
    class_name = params.get("class_name")
    stream = params.get("stream")
    if month:
        qs = qs.filter(month=month)
    if year:
        qs = qs.filter(year=year)
    if class_name:
        qs = qs.filter(student__class_name=class_name)
    if stream:
        qs = qs.filter(student__stream=stream)
    return qs


class MonthlyContributionReportView(APIView):
    """GET /api/reports/monthly/ — contribution totals grouped by month/year."""

    def get(self, request):
        qs = _apply_common_filters(Contribution.objects.all(), request.query_params)
        grouped = (
            qs.values("month", "year")
            .annotate(
                total_mahindi_submitted=Sum("mahindi_submitted"),
                total_mboga_submitted=Sum("mboga_submitted"),
                total_cash_submitted=Sum("cash_submitted"),
                total_mahindi_debt=Sum("mahindi_debt"),
                total_mboga_debt=Sum("mboga_debt"),
                total_cash_debt=Sum("cash_debt"),
                record_count=Count("id"),
            )
            .order_by("-year", "month")
        )
        return Response(list(grouped))


class DebtReportView(APIView):
    """GET /api/reports/debts/ — students with debt / debt report + class breakdown."""

    def get(self, request):
        qs = _apply_common_filters(
            Contribution.objects.select_related("student").filter(status="HAS_DEBT"),
            request.query_params,
        )
        by_class = (
            qs.values("student__class_name")
            .annotate(
                total_mahindi_debt=Sum("mahindi_debt"),
                total_mboga_debt=Sum("mboga_debt"),
                total_cash_debt=Sum("cash_debt"),
                student_count=Count("student", distinct=True),
            )
            .order_by("student__class_name")
        )
        return Response({
            "records": SpreadsheetRowSerializer(qs, many=True).data,
            "by_class": list(by_class),
        })


class SMSReportView(APIView):
    """GET /api/reports/sms/ — SMS delivery report."""

    def get(self, request):
        qs = SMSMessage.objects.all()
        month = request.query_params.get("month")
        if month:
            qs = qs.filter(created_at__month=month)

        summary = qs.aggregate(
            total=Count("id"),
            sent=Count("id", filter=Q(status="SENT")),
            failed=Count("id", filter=Q(status="FAILED")),
            pending=Count("id", filter=Q(status="PENDING")),
        )
        return Response({
            "summary": summary,
            "messages": SMSMessageSerializer(qs.order_by("-created_at")[:200], many=True).data,
        })


class CompletedStudentsReportView(APIView):
    """GET /api/reports/completed/ — students fully completed for given month/year."""

    def get(self, request):
        qs = _apply_common_filters(
            Contribution.objects.select_related("student").filter(status="COMPLETED"),
            request.query_params,
        )
        return Response(SpreadsheetRowSerializer(qs, many=True).data)
