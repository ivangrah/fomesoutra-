from django.contrib import admin

from .models import Filiere, Module


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ("code", "nom", "is_active")


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("code", "nom", "filiere", "niveau", "semestre", "is_active")
    list_filter = ("filiere", "niveau", "semestre", "is_active")
    search_fields = ("code", "nom")
    filter_horizontal = ("professeurs",)
