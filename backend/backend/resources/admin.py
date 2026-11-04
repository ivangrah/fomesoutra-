from django.contrib import admin

from .models import Download, Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("titre", "type", "module", "auteur", "date_limite", "created_at")
    list_filter = ("type", "module")
    search_fields = ("titre",)


@admin.register(Download)
class DownloadAdmin(admin.ModelAdmin):
    list_display = ("resource", "user", "at")
