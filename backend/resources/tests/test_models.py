from datetime import timedelta

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.utils import timezone

from resources.models import Resource


@pytest.fixture
def contexte(make_user, make_module):
    return {"auteur": make_user("p@uta.ci", role="professeur"), "module": make_module("IGL201")}


def fichier():
    return SimpleUploadedFile("cours.pdf", b"%PDF-1.4\n")


def test_cours_avec_fichier_sans_date_limite(contexte):
    r = Resource.objects.create(titre="Chap 1", type="cours", fichier=fichier(), **contexte)
    assert r.fichier.name.startswith(f"resources/{contexte['module'].id}/")
    assert "cours" not in r.fichier.name.split("/")[-1]  # nom d'origine non utilisé


def test_cours_ne_peut_pas_avoir_de_date_limite(contexte):
    with pytest.raises(IntegrityError), transaction.atomic():
        Resource.objects.create(
            titre="x", type="cours", fichier=fichier(), date_limite=timezone.now(), **contexte
        )


def test_devoir_exige_une_date_limite(contexte):
    with pytest.raises(IntegrityError), transaction.atomic():
        Resource.objects.create(titre="x", type="devoir", fichier=fichier(), **contexte)


def test_fichier_ou_lien_obligatoire(contexte):
    with pytest.raises(IntegrityError), transaction.atomic():
        Resource.objects.create(titre="x", type="cours", **contexte)
    ok = Resource.objects.create(
        titre="Vidéo", type="cours", lien_externe="https://youtu.be/abc", **contexte
    )
    assert ok.pk


def test_lien_externe_reserve_aux_cours(contexte):
    with pytest.raises(IntegrityError), transaction.atomic():
        Resource.objects.create(
            titre="x", type="devoir", fichier=fichier(), lien_externe="https://exemple.ci",
            date_limite=timezone.now() + timedelta(days=1), **contexte,
        )
