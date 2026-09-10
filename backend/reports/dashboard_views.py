from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q

from students.models import Student
from contributions.models import Contribution
from sms.models import SMSMessage


class DashboardView(APIView):
    """
    GET /api/dashboard/
    Aggregated stats powering the dashboard cards and charts.
    """

    def get(self, request):
        total_students = Student.objects.filter(status="ACTIVE").count()

        latest_year = request.query_params.get("year")
        contributions = Contribution.objects.all()
        if latest_year:
            contributions = contributions.filter(year=latest_year)

        students_with_debt = contributions.filter(status="HAS_DEBT").values("student").distinct().count()
        students_completed = contributions.filter(status="COMPLETED").values("student").distinct().count()

        debt_totals = contributions.aggregate(
            total_mahindi_debt=Sum("mahindi_debt"),
            total_mboga_debt=Sum("mboga_debt"),
            total_cash_debt=Sum("cash_debt"),
        )

        sms_totals = SMSMessage.objects.aggregate(
            sent=Count("id", filter=Q(status="SENT")),
            failed=Count("id", filter=Q(status="FAILED")),
            pending=Count("id", filter=Q(status="PENDING")),
        )

        monthly_summary = list(
            contributions.values("month", "year")
            .annotate(
                mahindi_submitted=Sum("mahindi_submitted"),
                mboga_submitted=Sum("mboga_submitted"),
                cash_submitted=Sum("cash_submitted"),
                mahindi_debt=Sum("mahindi_debt"),
                mboga_debt=Sum("mboga_debt"),
                cash_debt=Sum("cash_debt"),
            )
            .order_by("year", "month")
        )

        top_debtors = list(
            contributions.filter(status="HAS_DEBT")
            .select_related("student")
            .order_by("-cash_debt")[:10]
            .values(
                "student__full_name", "student__class_name", "student__stream",
                "mahindi_debt", "mboga_debt", "cash_debt", "month", "year",
            )
        )

        class_debt_summary = list(
            contributions.filter(status="HAS_DEBT")
            .values("student__class_name")
            .annotate(
                total_mahindi_debt=Sum("mahindi_debt"),
                total_mboga_debt=Sum("mboga_debt"),
                total_cash_debt=Sum("cash_debt"),
                student_count=Count("student", distinct=True),
            )
            .order_by("student__class_name")
        )

        recent_contributions = list(
            contributions.select_related("student").order_by("-created_at")[:8].values(
                "student__full_name", "month", "year", "cash_submitted",
                "mahindi_submitted", "mboga_submitted", "status", "created_at",
            )
        )

        recent_sms = list(
            SMSMessage.objects.select_related("student").order_by("-created_at")[:8].values(
                "student__full_name", "status", "message_type", "created_at"
            )
        )

        return Response({
            "total_students": total_students,
            "students_with_debt": students_with_debt,
            "students_completed": students_completed,
            "total_mahindi_debt": debt_totals["total_mahindi_debt"] or 0,
            "total_mboga_debt": debt_totals["total_mboga_debt"] or 0,
            "total_cash_debt": debt_totals["total_cash_debt"] or 0,
            "sms_sent": sms_totals["sent"] or 0,
            "sms_failed": sms_totals["failed"] or 0,
            "sms_pending": sms_totals["pending"] or 0,
            "monthly_summary": monthly_summary,
            "top_debtors": top_debtors,
            "class_debt_summary": class_debt_summary,
            "recent_contributions": recent_contributions,
            "recent_sms": recent_sms,
        })
