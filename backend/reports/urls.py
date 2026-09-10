from django.urls import path
from .views import (
    MonthlyContributionReportView, DebtReportView, SMSReportView,
    CompletedStudentsReportView,
)

urlpatterns = [
    path("monthly/", MonthlyContributionReportView.as_view(), name="report-monthly"),
    path("debts/", DebtReportView.as_view(), name="report-debts"),
    path("sms/", SMSReportView.as_view(), name="report-sms"),
    path("completed/", CompletedStudentsReportView.as_view(), name="report-completed"),
]
