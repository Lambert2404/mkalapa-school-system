from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemSettingsView, SMSTemplateViewSet

router = DefaultRouter()
router.register("templates", SMSTemplateViewSet, basename="sms-template")

urlpatterns = [
    path("", SystemSettingsView.as_view(), name="system-settings"),
    path("", include(router.urls)),
]
