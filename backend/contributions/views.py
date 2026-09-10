from rest_framework import viewsets, status as http_status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Contribution
from .serializers import ContributionSerializer, SpreadsheetRowSerializer


class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.select_related("student").all()
    serializer_class = ContributionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["month", "year", "status", "sms_status", "student"]
    search_fields = ["student__full_name", "student__student_id"]
    ordering_fields = ["year", "created_at", "cash_debt"]

    def get_serializer_class(self):
        if self.request and self.request.query_params.get("format") == "spreadsheet":
            return SpreadsheetRowSerializer
        return ContributionSerializer

    @action(detail=False, methods=["get"], url_path="spreadsheet")
    def spreadsheet(self, request):
        """Flattened rows for the embedded spreadsheet, with optional filters."""
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        serializer = SpreadsheetRowSerializer(page or qs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="bulk-update")
    def bulk_update(self, request):
        """
        Accepts a list of {id, mahindi_submitted, mboga_submitted, cash_submitted,
        notes, recorded_date} used by the spreadsheet's save/autosave behavior.
        """
        rows = request.data.get("rows", [])
        updated, errors = [], []
        for row in rows:
            try:
                contribution = Contribution.objects.get(pk=row.get("id"))
                for field in ["mahindi_submitted", "mboga_submitted", "cash_submitted",
                              "notes", "recorded_date"]:
                    if field in row and row[field] is not None:
                        setattr(contribution, field, row[field])
                contribution.save()
                updated.append(SpreadsheetRowSerializer(contribution).data)
            except Contribution.DoesNotExist:
                errors.append({"id": row.get("id"), "error": "Record not found."})
            except Exception as exc:
                errors.append({"id": row.get("id"), "error": str(exc)})

        return Response(
            {"updated": updated, "errors": errors},
            status=http_status.HTTP_207_MULTI_STATUS if errors else http_status.HTTP_200_OK,
        )
