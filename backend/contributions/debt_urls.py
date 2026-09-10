from django.urls import path
from .debt_views import DebtListView, StudentDebtDetailView

urlpatterns = [
    path("", DebtListView.as_view(), name="debt-list"),
    path("<int:student_id>/", StudentDebtDetailView.as_view(), name="debt-detail"),
]
