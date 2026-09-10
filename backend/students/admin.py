from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["student_id", "full_name", "class_name", "stream", "status", "guardian_phone"]
    search_fields = ["student_id", "full_name", "guardian_name"]
    list_filter = ["class_name", "stream", "status", "gender"]
