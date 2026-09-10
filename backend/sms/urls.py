from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SMSMessageViewSet, SendSingleSMSView, SendBulkSMSView, PreviewSMSView

router = DefaultRouter()
router.register("", SMSMessageViewSet, basename="sms-message")

urlpatterns = [
    path("send/", SendSingleSMSView.as_view(), name="sms-send"),
    path("send-bulk/", SendBulkSMSView.as_view(), name="sms-send-bulk"),
    path("preview/", PreviewSMSView.as_view(), name="sms-preview"),
    path("", include(router.urls)),
]
