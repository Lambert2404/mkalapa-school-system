from django.contrib import admin
from .models import SMSMessage


@admin.register(SMSMessage)
class SMSMessageAdmin(admin.ModelAdmin):
    list_display = ["student", "phone", "message_type", "status", "sent_at", "created_at"]
    list_filter = ["status", "message_type", "provider"]
    search_fields = ["student__full_name", "phone"]
