import re
from django.core.exceptions import ValidationError
from django.db import models


def normalize_tz_phone(value: str) -> str:
    """
    Normalize a Tanzanian phone number to the format 2557XXXXXXXX / 2556XXXXXXXX.

    Accepts:
        07XXXXXXXX
        06XXXXXXXX
        2557XXXXXXXX
        2556XXXXXXXX
        +2557XXXXXXXX
    """
    if not value:
        return value
    digits = re.sub(r"\D", "", value)

    if digits.startswith("0") and len(digits) == 10:
        digits = "255" + digits[1:]
    elif digits.startswith("255") and len(digits) == 12:
        pass
    elif digits.startswith("7") or digits.startswith("6"):
        if len(digits) == 9:
            digits = "255" + digits

    if not re.match(r"^255[67]\d{8}$", digits):
        raise ValidationError(
            f"'{value}' is not a valid Tanzanian phone number. "
            "Expected formats: 07XXXXXXXX, 06XXXXXXXX or 2557XXXXXXXX."
        )
    return digits


class Student(models.Model):
    GENDER_CHOICES = [
        ("MALE", "Male"),
        ("FEMALE", "Female"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
        ("GRADUATED", "Graduated"),
        ("TRANSFERRED", "Transferred"),
    ]

    CLASS_CHOICES = [
        ("Form One", "Form One"),
        ("Form Two", "Form Two"),
        ("Form Three", "Form Three"),
        ("Form Four", "Form Four"),
    ]

    STREAM_CHOICES = [
        ("A", "A"),
        ("B", "B"),
        ("C", "C"),
        ("D", "D"),
    ]

    student_id = models.CharField(max_length=20, unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    class_name = models.CharField(max_length=20, choices=CLASS_CHOICES)
    stream = models.CharField(max_length=5, choices=STREAM_CHOICES)

    guardian_name = models.CharField(max_length=150)
    guardian_phone = models.CharField(max_length=15)
    alternative_phone = models.CharField(max_length=15, blank=True, null=True)

    address = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="ACTIVE")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["full_name"]

    def save(self, *args, **kwargs):
        if self.guardian_phone:
            self.guardian_phone = normalize_tz_phone(self.guardian_phone)
        if self.alternative_phone:
            self.alternative_phone = normalize_tz_phone(self.alternative_phone)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student_id} - {self.full_name}"
