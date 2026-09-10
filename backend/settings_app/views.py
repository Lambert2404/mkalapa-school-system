from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets

from .models import SystemSettings, SMSTemplate
from .serializers import SystemSettingsSerializer, SMSTemplateSerializer


class SystemSettingsView(APIView):
    """GET/PUT /api/settings/ — singleton settings object."""

    def get(self, request):
        obj = SystemSettings.get_solo()
        return Response(SystemSettingsSerializer(obj).data)

    def put(self, request):
        obj = SystemSettings.get_solo()
        serializer = SystemSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SMSTemplateViewSet(viewsets.ModelViewSet):
    queryset = SMSTemplate.objects.all()
    serializer_class = SMSTemplateSerializer
