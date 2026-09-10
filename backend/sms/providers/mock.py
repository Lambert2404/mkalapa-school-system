import random
import uuid

from .base import SMSProvider


class MockSMSProvider(SMSProvider):
    """
    Simulates an SMS gateway so the app is fully testable before real
    NextSMS credentials are configured. Randomly simulates Sent / Failed
    outcomes (90% success rate) with a fake provider message id.
    """

    def send(self, phone: str, message: str) -> dict:
        success = random.random() < 0.9

        if success:
            return {
                "success": True,
                "provider_message_id": f"MOCK-{uuid.uuid4().hex[:10].upper()}",
                "gateway_response": "Mock gateway: message accepted for delivery.",
                "error_message": "",
            }
        return {
            "success": False,
            "provider_message_id": "",
            "gateway_response": "Mock gateway: simulated delivery failure.",
            "error_message": "Simulated failure: network/handset unreachable.",
        }
