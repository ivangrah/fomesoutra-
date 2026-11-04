from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

from core.constants import NIVEAU_CHOICES, ROLE_ADMIN, ROLE_ETUDIANT, ROLE_PROFESSEUR, SEMESTRE_CHOICES


class Filiere(models.Model):
    code = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return self.code


class ModuleQuerySet(models.QuerySet):
    def visible_to(self, user):
        """Règle d'accès aux modules (source unique, utilisée par toute l'API)."""
        if not user or not user.is_authenticated:
            return self.none()
        if user.role == ROLE_ADMIN:
            return self
        active = self.filter(is_active=True)
        if user.role == ROLE_PROFESSEUR:
            return active.filter(professeurs=user)
        if user.role == ROLE_ETUDIANT:
            return active.filter(filiere_id=user.filiere_id, niveau=user.niveau)
        return self.none()


class Module(models.Model):
    code = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=200)
    filiere = models.ForeignKey(Filiere, on_delete=models.PROTECT, related_name="modules")
    niveau = models.CharField(max_length=2, choices=NIVEAU_CHOICES)
    semestre = models.CharField(max_length=2, choices=SEMESTRE_CHOICES)
    couleur = models.CharField(
        max_length=7,
        default="#1E7B34",
        validators=[RegexValidator(r"^#[0-9A-Fa-f]{6}$", "Couleur hexadécimale attendue.")],
    )
    is_active = models.BooleanField(default=True)
    professeurs = models.ManyToManyField(
        settings.AUTH_USER_MODEL, blank=True, related_name="modules_enseignes"
    )

    objects = ModuleQuerySet.as_manager()

    class Meta:
        ordering = ["niveau", "semestre", "code"]
        indexes = [models.Index(fields=["filiere", "niveau", "is_active"])]

    def __str__(self):
        return f"{self.code} — {self.nom}"
