from rest_framework.permissions import BasePermission

from .constants import ROLE_ADMIN, ROLE_ETUDIANT, ROLE_PROFESSEUR


class IsActiveAndApproved(BasePermission):
    """Permission par défaut : compte actif et, pour un professeur, validé."""

    message = "Compte désactivé ou en attente de validation."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_approved)


class _HasRole(IsActiveAndApproved):
    role = None
    message = "Action non autorisée pour votre rôle."

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == self.role


class IsEtudiant(_HasRole):
    role = ROLE_ETUDIANT


class IsProfesseur(_HasRole):
    role = ROLE_PROFESSEUR


class IsAdminRole(_HasRole):
    role = ROLE_ADMIN
