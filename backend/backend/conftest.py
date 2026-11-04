import pytest

from academic.models import Filiere, Module
from accounts.models import User


@pytest.fixture(autouse=True)
def _tmp_storage(settings, tmp_path):
    """Les fichiers de test vont dans un dossier temporaire."""
    settings.STORAGES = {
        **settings.STORAGES,
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
            "OPTIONS": {"location": str(tmp_path)},
        },
    }


@pytest.fixture
def filiere(db):
    return Filiere.objects.create(code="IGL", nom="Informatique et Génie Logiciel")


@pytest.fixture
def make_user(db, filiere):
    def _make(email, role="etudiant", niveau="L2", **extra):
        if role == "etudiant":
            extra.setdefault("filiere", filiere)
            extra["niveau"] = niveau
        return User.objects.create_user(
            email, "motdepasse123", role=role, nom="Nom", prenom="Prenom", **extra
        )

    return _make


@pytest.fixture
def make_module(db, filiere):
    def _make(code, niveau="L2", **extra):
        return Module.objects.create(
            code=code, nom=f"Module {code}", filiere=filiere, niveau=niveau,
            semestre="S3", **extra,
        )

    return _make
