from django.db import models
from students.models import Student

MESSAGE_TYPE_CHOICES = [
    ("DEBT_REMINDER", "Debt Reminder"),
    ("COMPLETION", "Completion"),
    ("CUSTOM", "Custom"),
]

MESSAGE_STATUS_CHOICES = [
    ("PENDING", "Pending"),
    ("SENT", "Sent"),
    ("FAILED", "Failed"),
]


class SMSMessage(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="sms_messages")
    phone = models.CharField(max_length=15)
    message = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=MESSAGE_STATUS_CHOICES, default="PENDING")

    provider = models.CharField(max_length=30, blank=True)
    provider_message_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.TextField(blank=True)
    error_message = models.TextField(blank=True)

    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"SMS to {self.student.full_name} ({self.status})"
