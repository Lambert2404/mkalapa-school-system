"""
sms_service.py

Central SMS abstraction used by views. Handles:
  - generate_debt_sms()        -> smart Swahili debt-reminder text
  - generate_completion_sms()  -> Swahili completion text
  - send_sms()                 -> send one message, log the attempt
  - send_bulk_sms()             -> send to many students, log each attempt

Only outstanding (non-zero) items are mentioned in the debt-reminder
message (Rule 9). If all three are zero, callers should use
generate_completion_sms() instead.
"""

from django.conf import settings
from django.utils import timezone

from sms.models import SMSMessage
from sms.providers.mock import MockSMSProvider
from sms.providers.nextsms import NextSMSProvider


def get_provider():
    if settings.SMS_PROVIDER == "nextsms":
        return NextSMSProvider()
    return MockSMSProvider()


def _format_kg(value) -> str:
    value = float(value)
    if value == int(value):
        return f"{int(value)} Kg"
    return f"{value} Kg"


def _format_tsh(value) -> str:
    value = float(value)
    return f"TSh {int(value):,}"


def generate_debt_sms(contribution, school_name="MKALAPA SECONDARY SCHOOL") -> str:
    """
    Build the smart debt-reminder message. Only non-zero debt items are
    included, joined naturally in Swahili ("X, Y na Z").
    """
    student = contribution.student
    month_year = f"{contribution.month} {contribution.year}"

    parts = []
    if contribution.mahindi_debt and contribution.mahindi_debt > 0:
        parts.append(f"Mahindi {_format_kg(contribution.mahindi_debt)}")
    if contribution.mboga_debt and contribution.mboga_debt > 0:
        parts.append(f"Mboga {_format_kg(contribution.mboga_debt)}")
    if contribution.cash_debt and contribution.cash_debt > 0:
        parts.append(f"Fedha {_format_tsh(contribution.cash_debt)}")

    if not parts:
        return generate_completion_sms(contribution, school_name)

    if len(parts) == 1:
        debt_phrase = f"la {parts[0]}"
    else:
        debt_phrase = ": " + ", ".join(parts[:-1]) + f" na {parts[-1]}"

    return (
        f"{school_name}: Mzazi/Mlezi wa {student.full_name.upper()}, mwanafunzi wako "
        f"ana deni la mwezi {month_year} {debt_phrase}. Tafadhali kamilisha deni lako. Asante."
    )


def generate_completion_sms(contribution, school_name="MKALAPA SECONDARY SCHOOL") -> str:
    student = contribution.student
    month_year = f"{contribution.month} {contribution.year}"
    return (
        f"{school_name}: Mzazi/Mlezi wa {student.full_name.upper()}, tunakujulisha kuwa "
        f"mwanao amekamilisha mchango wa mwezi {month_year}. Asante kwa ushirikiano."
    )


def send_sms(student, phone, message, message_type="CUSTOM", contribution=None) -> SMSMessage:
    """Send one SMS and persist a full delivery log entry."""
    provider = get_provider()
    result = provider.send(phone, message)

    record = SMSMessage.objects.create(
        student=student,
        phone=phone,
        message=message,
        message_type=message_type,
        status="SENT" if result["success"] else "FAILED",
        provider=settings.SMS_PROVIDER,
        provider_message_id=result.get("provider_message_id", ""),
        gateway_response=result.get("gateway_response", ""),
        error_message=result.get("error_message", ""),
        sent_at=timezone.now() if result["success"] else None,
    )

    if contribution is not None:
        contribution.sms_status = "SENT" if result["success"] else "FAILED"
        contribution.save(update_fields=["sms_status"])

    return record


def send_bulk_sms(contributions, message_type="DEBT_REMINDER", school_name="MKALAPA SECONDARY SCHOOL"):
    """
    Send debt-reminder (or completion) SMS to a queryset/list of Contribution
    records. Returns a summary dict with counts and the created SMSMessage list.
    """
    results = []
    for contribution in contributions:
        student = contribution.student
        if contribution.status == "COMPLETED":
            message = generate_completion_sms(contribution, school_name)
            m_type = "COMPLETION"
        else:
            message = generate_debt_sms(contribution, school_name)
            m_type = "DEBT_REMINDER"

        record = send_sms(student, student.guardian_phone, message, m_type, contribution)
        results.append(record)

    sent = sum(1 for r in results if r.status == "SENT")
    failed = sum(1 for r in results if r.status == "FAILED")
    return {"total": len(results), "sent": sent, "failed": failed, "messages": results}
