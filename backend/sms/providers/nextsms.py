import base64
import requests
from django.conf import settings

from .base import SMSProvider

# Status "groupId" values from the NextSMS API status-code reference.
# https://documenter.getpostman.com/view/1679195/2sAYkDP1XN#response-status-and-error-codes
PENDING_GROUP = 18    # accepted / awaiting delivery report -> treat as sent-in-progress
DELIVERY_GROUP = 20   # delivery report received (delivered, undeliverable, etc.)
FAILED_GROUP = 22     # message could not be processed at all
REJECTED_GROUP = 19   # message rejected by NextSMS or the operator

# Within the DELIVERY group, these specific status ids count as a real failure
# rather than a successful send.
DELIVERY_FAILURE_IDS = {74, 75, 76, 78, 79, 80}


class NextSMSProvider(SMSProvider):
    """
    Integration with NextSMS "Messaging Service API V2"
    (https://messaging-service.co.tz).

    Auth: Bearer token is the NextSMS-recommended method
    (Authorization: Bearer <SMS_ACCESS_TOKEN>). Basic auth
    (base64 of api_key:api_secret) is also supported as a fallback.

    Credentials are read ONLY from backend environment variables and are
    never exposed to the frontend.

    NOTE: The exact request-body field names for /api/sms/v2/text/single
    were not fully machine-readable from the public Postman documentation
    page at integration time (the docs page renders the body schema via
    JavaScript). This implementation uses the field names NextSMS documents
    elsewhere in their guides ("from", "to", "text"). Before going live,
    confirm the exact payload shape against your NextSMS dashboard's
    Postman collection / API Keys page and adjust `_build_payload` if needed.
    """

    def __init__(self):
        self.base_url = settings.SMS_BASE_URL
        self.sender_id = settings.SMS_SENDER_ID
        self.auth_method = settings.SMS_AUTH_METHOD
        self.access_token = settings.SMS_ACCESS_TOKEN
        self.api_key = settings.SMS_API_KEY
        self.api_secret = settings.SMS_API_SECRET

    def _headers(self) -> dict:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.auth_method == "basic":
            token = base64.b64encode(f"{self.api_key}:{self.api_secret}".encode()).decode()
            headers["Authorization"] = f"Basic {token}"
        else:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers

    def _build_payload(self, phone: str, message: str) -> dict:
        return {
            "from": self.sender_id,
            "to": phone,
            "text": message,
        }

    def _interpret_status(self, status_obj: dict) -> bool:
        """Given a NextSMS `status` object {groupId, groupName, id, name, ...},
        decide whether this counts as a successful submission."""
        if not isinstance(status_obj, dict):
            return True  # unknown shape; assume 2xx HTTP means accepted
        group_id = status_obj.get("groupId")
        status_id = status_obj.get("id")
        if group_id in (FAILED_GROUP, REJECTED_GROUP):
            return False
        if group_id == DELIVERY_GROUP and status_id in DELIVERY_FAILURE_IDS:
            return False
        return True

    def send(self, phone: str, message: str) -> dict:
        headers = self._headers()
        payload = self._build_payload(phone, message)

        try:
            response = requests.post(self.base_url, json=payload, headers=headers, timeout=15)
            data = response.json() if response.content else {}

            if response.status_code not in (200, 201):
                return {
                    "success": False,
                    "provider_message_id": "",
                    "gateway_response": str(data),
                    "error_message": f"NextSMS returned HTTP {response.status_code}: {data}",
                }

            # NextSMS typically returns either a single message object or a
            # {"messages": [...]} envelope. Handle both shapes defensively.
            message_obj = data
            if isinstance(data, dict) and "messages" in data and data["messages"]:
                message_obj = data["messages"][0]

            status_obj = message_obj.get("status") if isinstance(message_obj, dict) else None
            success = self._interpret_status(status_obj)
            message_id = message_obj.get("messageId", "") if isinstance(message_obj, dict) else ""

            return {
                "success": success,
                "provider_message_id": message_id,
                "gateway_response": str(data),
                "error_message": "" if success else f"NextSMS status: {status_obj}",
            }
        except requests.RequestException as exc:
            return {
                "success": False,
                "provider_message_id": "",
                "gateway_response": "",
                "error_message": f"NextSMS request failed: {exc}",
            }
