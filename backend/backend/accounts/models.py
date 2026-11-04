from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower
from django.utils import timezone

from core.constants import (
    NIVEAU_CHOICES,
    ROLE_ADMIN,
    ROLE_CHOICES,
    ROLE_ETUDIANT,
    ROLE_PROFESSEUR,
)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("L'adresse e-mail est obligatoire.")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("role", ROLE_ETUDIANT)
        # Seuls les professeurs attendent une validation de l'administration.
        extra.setdefault("is_approved", extra["role"] != ROLE_PROFESSEUR)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.update(role=ROLE_ADMIN, is_approved=True, is_superuser=True)
        return self._create(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField("e-mail", unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField("prénom", max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_ETUDIANT)
    filiere = models.ForeignKey(
        "academic.Filiere", null=True, blank=True, on_delete=models.PROTECT, related_name="users"
    )
    niveau = models.CharField(max_length=2, choices=NIVEAU_CHOICES, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nom", "prenom"]

    class Meta:
        ordering = ["-date_joined"]
        constraints = [
            # E-mail toujours en minuscules : l'unicité devient insensible à la casse.
            models.CheckConstraint(
                condition=Q(email=Lower("email")), name="user_email_is_lowercase"
            ),
            models.CheckConstraint(
                condition=~Q(role=ROLE_ETUDIANT)
                | (Q(niveau__isnull=False) & Q(filiere__isnull=False)),
                name="student_has_filiere_and_niveau",
            ),
            models.CheckConstraint(
                condition=Q(role=ROLE_ETUDIANT) | Q(niveau__isnull=True),
                name="only_students_have_niveau",
            ),
        ]

    @property
    def is_staff(self):
        """Accès à l'admin Django : réservé aux administrateurs de la plateforme."""
        return self.is_active and self.role == ROLE_ADMIN

    @property
    def full_name(self):
        return f"{self.prenom} {self.nom}".strip()

    def __str__(self):
        return self.email
