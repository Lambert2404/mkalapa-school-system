from django.contrib import admin
from .models import SystemSettings, SMSTemplate

admin.site.register(SystemSettings)
admin.site.register(SMSTemplate)
