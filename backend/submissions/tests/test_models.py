from datetime import timedelta

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.utils import timezone

from resources.models import Resource
from submissions.models import Submission


@pytest.fixture
def devoir(make_user, make_module):
    return Resource.objects.create(
        titre="TP 2", type="devoir", module=make_module("IGL201"),
        auteur=make_user("p@uta.ci", role="professeur"),
        fichier=SimpleUploadedFile("tp.pdf", b"%PDF-1.4\n"),
        date_limite=timezone.now() + timedelta(days=2),
    )


def rendu(devoir, etudiant, **extra):
    return Submission(
        resource=devoir, etudiant=etudiant,
        fichier=SimpleUploadedFile("rendu.zip", b"PK\x03\x04"), **extra,
    )


def test_un_seul_rendu_par_etudiant_et_par_devoir(devoir, make_user):
    etudiant = make_user("e@uta.ci")
    rendu(devoir, etudiant).save()
    with pytest.raises(IntegrityError), transaction.atomic():
        rendu(devoir, etudiant).save()


def test_dans_les_delais(devoir, make_user):
    assert rendu(devoir, make_user("e@uta.ci")).compute_is_late() is False


def test_en_retard_apres_la_date_limite(devoir, make_user):
    tard = rendu(devoir, make_user("e@uta.ci"), submitted_at=devoir.date_limite + timedelta(hours=1))
    assert tard.compute_is_late() is True
