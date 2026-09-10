"""
Reusable calculation engine for contribution/debt logic.

Rules (see project spec):
  - Debt can never be negative -> MAX(0, required - submitted)
  - Mahindi and Mboga are measured in KG, Cash in TSh. Never combine
    KG and TSh into a single monetary total.
  - Total Debt is only meaningful as "Total Debt exists" (boolean-ish)
    or as separate KG/TSh subtotals — never summed into one number.
  - Status is COMPLETED only when all three debts are zero.

The frontend may replicate this logic for instant/optimistic UI feedback,
but this module is the single source of truth used by the backend on save.
"""

from decimal import Decimal


def calculate_mahindi_debt(required, submitted) -> Decimal:
    required = Decimal(required or 0)
    submitted = Decimal(submitted or 0)
    return max(Decimal("0"), required - submitted)


def calculate_mboga_debt(required, submitted) -> Decimal:
    required = Decimal(required or 0)
    submitted = Decimal(submitted or 0)
    return max(Decimal("0"), required - submitted)


def calculate_cash_debt(required, submitted) -> Decimal:
    required = Decimal(required or 0)
    submitted = Decimal(submitted or 0)
    return max(Decimal("0"), required - submitted)


def has_any_debt(mahindi_debt, mboga_debt, cash_debt) -> bool:
    return (Decimal(mahindi_debt or 0) > 0
            or Decimal(mboga_debt or 0) > 0
            or Decimal(cash_debt or 0) > 0)


def get_debt_status(mahindi_debt, mboga_debt, cash_debt) -> str:
    return "HAS_DEBT" if has_any_debt(mahindi_debt, mboga_debt, cash_debt) else "COMPLETED"


def calculate_all(mahindi_required, mahindi_submitted,
                   mboga_required, mboga_submitted,
                   cash_required, cash_submitted) -> dict:
    """Compute all derived debt fields at once. Used on Contribution.save()."""
    mahindi_debt = calculate_mahindi_debt(mahindi_required, mahindi_submitted)
    mboga_debt = calculate_mboga_debt(mboga_required, mboga_submitted)
    cash_debt = calculate_cash_debt(cash_required, cash_submitted)
    status = get_debt_status(mahindi_debt, mboga_debt, cash_debt)
    return {
        "mahindi_debt": mahindi_debt,
        "mboga_debt": mboga_debt,
        "cash_debt": cash_debt,
        "status": status,
    }
