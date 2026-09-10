from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/students/", include("students.urls")),
    path("api/contributions/", include("contributions.urls")),
    path("api/debts/", include("contributions.debt_urls")),
    path("api/sms/", include("sms.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/settings/", include("settings_app.urls")),
    path("api/dashboard/", include("reports.dashboard_urls")),
]
