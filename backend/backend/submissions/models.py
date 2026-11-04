from django.conf import settings
from django.db import models
from django.utils import timezone

from core.files import unique_path


def submission_upload_to(instance, filename):
    return unique_path(f"submissions/{instance.resource_id}", filename)


class Submission(models.Model):
    resource = models.ForeignKey(
        "resources.Resource", on_delete=models.CASCADE, related_name="submissions"
    )
    etudiant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="rendus"
    )
    fichier = models.FileField(upload_to=submission_upload_to)
    nom_original = models.CharField(max_length=255, blank=True)
    taille = models.PositiveBigIntegerField(default=0)
    mime = models.CharField(max_length=100, blank=True)
    commentaire = models.TextField(blank=True)
    submitted_at = models.DateTimeField(default=timezone.now)  # mis à jour au remplacement
    is_late = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [models.Index(fields=["etudiant", "-submitted_at"])]
        constraints = [
            # Un seul rendu par étudiant et par devoir : un nouveau dépôt écrase l'ancien.
            models.UniqueConstraint(
                fields=["resource", "etudiant"], name="one_submission_per_student_per_resource"
            )
        ]

    def compute_is_late(self):
        """Retard = dernier dépôt après la date limite (les retards sont acceptés)."""
        deadline = self.resource.date_limite
        return bool(deadline and self.submitted_at > deadline)
