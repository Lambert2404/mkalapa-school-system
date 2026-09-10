from django.contrib import admin
from .models import Contribution


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ["student", "month", "year", "mahindi_debt", "mboga_debt", "cash_debt", "status"]
    list_filter = ["month", "year", "status", "sms_status"]
    search_fields = ["student__full_name", "student__student_id"]
