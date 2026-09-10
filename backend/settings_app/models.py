from django.db import models


class SystemSettings(models.Model):
    """
    Singleton model holding school info and default monthly requirements.
    Changing these values only affects FUTURE contribution records
    (Rule 11 — historical records keep their snapshotted requirement values).
    """
    school_name = models.CharField(max_length=200, default="MKALAPA SECONDARY SCHOOL")
    school_phone = models.CharField(max_length=20, blank=True)
    school_address = models.CharField(max_length=255, blank=True)
    sender_name = models.CharField(max_length=20, default="MKALAPA")

    mahindi_requirement = models.DecimalField(max_digits=8, decimal_places=2, default=10)
    mboga_requirement = models.DecimalField(max_digits=8, decimal_places=2, default=5)
    cash_requirement = models.DecimalField(max_digits=10, decimal_places=2, default=15000)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.school_name


class SMSTemplate(models.Model):
    TYPE_CHOICES = [
        ("DEBT_REMINDER", "Debt Reminder"),
        ("COMPLETION", "Completion"),
        ("CUSTOM", "Custom"),
    ]

    name = models.CharField(max_length=100)
    template = models.TextField(
        help_text="Use placeholders: {guardian}, {student}, {month}, {year}, {debt_items}"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.type})"
