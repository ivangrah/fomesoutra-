from django.conf import settings
from django.db import models
from django.db.models import Q

from core.constants import TYPE_CHOICES, TYPE_COURS
from core.files import unique_path


def resource_upload_to(instance, filename):
    return unique_path(f"resources/{instance.module_id}", filename)


class Resource(models.Model):
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    module = models.ForeignKey("academic.Module", on_delete=models.PROTECT, related_name="resources")
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="resources_publiees"
    )
    fichier = models.FileField(upload_to=resource_upload_to, blank=True)
    nom_original = models.CharField(max_length=255, blank=True)
    taille = models.PositiveBigIntegerField(default=0)
    mime = models.CharField(max_length=100, blank=True)
    lien_externe = models.URLField(blank=True)  # cours seulement (longues vidéos)
    date_limite = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["module", "type", "-created_at"]),
            models.Index(fields=["date_limite"]),
        ]
        constraints = [
            # Un cours n'a pas de date limite ; un devoir ou un examen en a une.
            models.CheckConstraint(
                condition=Q(type=TYPE_COURS, date_limite__isnull=True)
                | (~Q(type=TYPE_COURS) & Q(date_limite__isnull=False)),
                name="resource_deadline_matches_type",
            ),
            models.CheckConstraint(
                condition=Q(type=TYPE_COURS) | Q(lien_externe=""),
                name="resource_link_only_for_cours",
            ),
            models.CheckConstraint(
                condition=~Q(fichier="") | ~Q(lien_externe=""),
                name="resource_has_file_or_link",
            ),
        ]

    def __str__(self):
        return self.titre


class Download(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="downloads")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="downloads"
    )
    at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-at"]
        indexes = [models.Index(fields=["user", "-at"])]
