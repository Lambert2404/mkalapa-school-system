from django.db import models
from django.core.exceptions import ValidationError

from students.models import Student
from .calculations import calculate_all

MONTH_CHOICES = [
    ("JANUARY", "January"), ("FEBRUARY", "February"), ("MARCH", "March"),
    ("APRIL", "April"), ("MAY", "May"), ("JUNE", "June"),
    ("JULY", "July"), ("AUGUST", "August"), ("SEPTEMBER", "September"),
    ("OCTOBER", "October"), ("NOVEMBER", "November"), ("DECEMBER", "December"),
]

STATUS_CHOICES = [
    ("HAS_DEBT", "Has Debt"),
    ("COMPLETED", "Completed"),
]

SMS_STATUS_CHOICES = [
    ("NOT_SENT", "Not Sent"),
    ("PENDING", "Pending"),
    ("SENT", "Sent"),
    ("FAILED", "Failed"),
]


class Contribution(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="contributions")
    month = models.CharField(max_length=10, choices=MONTH_CHOICES)
    year = models.PositiveIntegerField()

    # Requirements are snapshotted at creation time so historical records
    # are never silently changed when Settings are updated later (Rule 11).
    mahindi_required = models.DecimalField(max_digits=8, decimal_places=2, default=10)
    mahindi_submitted = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    mahindi_debt = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    mboga_required = models.DecimalField(max_digits=8, decimal_places=2, default=5)
    mboga_submitted = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    mboga_debt = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    cash_required = models.DecimalField(max_digits=10, decimal_places=2, default=15000)
    cash_submitted = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cash_debt = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="HAS_DEBT")
    sms_status = models.CharField(max_length=15, choices=SMS_STATUS_CHOICES, default="NOT_SENT")

    recorded_date = models.DateField()
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-year", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "month", "year"],
                name="unique_student_month_year",
            )
        ]

    def clean(self):
        # Rule 5: debt/quantities can never be negative.
        for field in ["mahindi_submitted", "mboga_submitted", "cash_submitted"]:
            value = getattr(self, field)
            if value is not None and value < 0:
                raise ValidationError({field: f"{field} cannot be negative."})

    def recalculate(self):
        result = calculate_all(
            self.mahindi_required, self.mahindi_submitted,
            self.mboga_required, self.mboga_submitted,
            self.cash_required, self.cash_submitted,
        )
        self.mahindi_debt = result["mahindi_debt"]
        self.mboga_debt = result["mboga_debt"]
        self.cash_debt = result["cash_debt"]
        self.status = result["status"]

    def save(self, *args, **kwargs):
        self.full_clean(exclude=[f.name for f in self._meta.fields if f.name not in
                                  ["mahindi_submitted", "mboga_submitted", "cash_submitted"]])
        self.recalculate()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.full_name} - {self.month} {self.year}"
