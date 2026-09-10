import random
from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from students.models import Student
from contributions.models import Contribution
from settings_app.models import SystemSettings, SMSTemplate

DEMO_STUDENTS = [
    # student_id, full_name, gender, class, stream, guardian, phone
    ("MK001", "John Mwakyusa", "MALE", "Form Two", "A", "Peter Mwakyusa", "0712345678"),
    ("MK002", "Amina Hassan", "FEMALE", "Form One", "B", "Hassan Juma", "0765432109"),
    ("MK003", "Baraka Mushi", "MALE", "Form Three", "A", "Elizabeth Mushi", "0754112233"),
    ("MK004", "Neema Kileo", "FEMALE", "Form Two", "C", "Godfrey Kileo", "0687654321"),
    ("MK005", "Emmanuel Shirima", "MALE", "Form Four", "A", "Rose Shirima", "0715551234"),
    ("MK006", "Fatuma Ally", "FEMALE", "Form One", "A", "Ally Said", "0673344556"),
    ("MK007", "Daniel Mrema", "MALE", "Form Three", "B", "Grace Mrema", "0788990011"),
    ("MK008", "Happiness Ndosi", "FEMALE", "Form Four", "B", "Samuel Ndosi", "0719988776"),
    ("MK009", "Yusuph Kimaro", "MALE", "Form Two", "B", "Fatma Kimaro", "0655443322"),
    ("MK010", "Grace Mbwana", "FEMALE", "Form Three", "C", "Joseph Mbwana", "0742233445"),
    ("MK011", "Ibrahim Chuma", "MALE", "Form One", "C", "Mariam Chuma", "0723456789"),
    ("MK012", "Salma Kondo", "FEMALE", "Form Four", "A", "Kondo Rashid", "0698765432"),
]

# (mahindi_submitted, mboga_submitted, cash_submitted) scenarios cycling
# through: fully completed, mahindi-only debt, mboga-only, cash-only, multi-debt
SCENARIOS = [
    (10, 5, 15000),   # completed
    (7, 5, 15000),    # mahindi debt only
    (10, 3, 15000),   # mboga debt only
    (10, 5, 10000),   # cash debt only
    (7, 3, 10000),    # multiple debts
    (10, 5, 15000),   # completed
    (5, 2, 5000),     # multiple debts (large)
    (10, 5, 15000),   # completed
    (0, 0, 0),        # multiple debts (nothing submitted)
    (10, 4, 15000),   # mboga debt only
    (8, 5, 15000),    # mahindi debt only
    (10, 5, 12000),   # cash debt only
]


class Command(BaseCommand):
    help = "Seed the database with demo students and September 2026 contribution records."

    def handle(self, *args, **options):
        with transaction.atomic():
            settings_obj = SystemSettings.get_solo()
            settings_obj.school_name = "MKALAPA SECONDARY SCHOOL"
            settings_obj.sender_name = "MKALAPA"
            settings_obj.mahindi_requirement = 10
            settings_obj.mboga_requirement = 5
            settings_obj.cash_requirement = 15000
            settings_obj.save()

            if not SMSTemplate.objects.filter(type="DEBT_REMINDER").exists():
                SMSTemplate.objects.create(
                    name="Default Debt Reminder",
                    type="DEBT_REMINDER",
                    template=(
                        "{school_name}: Mzazi/Mlezi wa {student}, mwanafunzi wako ana deni "
                        "la mwezi {month} {year}: {debt_items}. Tafadhali kamilisha deni lako. Asante."
                    ),
                )
            if not SMSTemplate.objects.filter(type="COMPLETION").exists():
                SMSTemplate.objects.create(
                    name="Default Completion",
                    type="COMPLETION",
                    template=(
                        "{school_name}: Mzazi/Mlezi wa {student}, tunakujulisha kuwa mwanafunzi "
                        "wako amekamilisha mchango wa mwezi {month} {year}. Asante."
                    ),
                )

            created_students = 0
            for student_id, name, gender, class_name, stream, guardian, phone in DEMO_STUDENTS:
                student, created = Student.objects.get_or_create(
                    student_id=student_id,
                    defaults=dict(
                        full_name=name, gender=gender, class_name=class_name, stream=stream,
                        guardian_name=guardian, guardian_phone=phone, status="ACTIVE",
                        date_of_birth=date(2009, random.randint(1, 12), random.randint(1, 28)),
                        address="Mbeya, Tanzania",
                    ),
                )
                if created:
                    created_students += 1

                mahindi_sub, mboga_sub, cash_sub = SCENARIOS[DEMO_STUDENTS.index(
                    (student_id, name, gender, class_name, stream, guardian, phone)
                )]

                Contribution.objects.get_or_create(
                    student=student, month="SEPTEMBER", year=2026,
                    defaults=dict(
                        mahindi_required=10, mahindi_submitted=mahindi_sub,
                        mboga_required=5, mboga_submitted=mboga_sub,
                        cash_required=15000, cash_submitted=cash_sub,
                        recorded_date=date(2026, 9, 5),
                        notes="Demo seed data",
                    ),
                )

            self.stdout.write(self.style.SUCCESS(
                f"Seed complete. Created {created_students} new students "
                f"({Student.objects.count()} total, {Contribution.objects.count()} contribution records)."
            ))
