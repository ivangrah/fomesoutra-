from django.contrib import admin

from .models import Submission


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("resource", "etudiant", "submitted_at", "is_late")
    list_filter = ("is_late",)
