from abc import ABC, abstractmethod


class SMSProvider(ABC):
    """
    Abstract SMS provider interface. Concrete providers (NextSMSProvider,
    MockSMSProvider, ...) implement `send`. This makes it possible to swap
    SMS gateways later without touching calling code.
    """

    @abstractmethod
    def send(self, phone: str, message: str) -> dict:
        """
        Send a single SMS.

        Returns a dict:
            {
                "success": bool,
                "provider_message_id": str,
                "gateway_response": str,
                "error_message": str,
            }
        """
        raise NotImplementedError
