from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "nom", "prenom", "role", "is_approved", "is_active")
    list_filter = ("role", "is_approved", "is_active")
    search_fields = ("email", "nom", "prenom")
    exclude = ("password", "groups", "user_permissions")
    readonly_fields = ("last_login", "date_joined")

    def has_add_permission(self, request):
        return False  # les comptes se créent par l'inscription ou `createsuperuser`
