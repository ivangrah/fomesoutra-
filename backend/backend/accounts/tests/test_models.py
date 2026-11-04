import pytest
from django.db import IntegrityError, transaction

from accounts.auth import user_authentication_rule
from accounts.models import User


def test_email_normalise_en_minuscules(make_user):
    user = make_user("Awa.Kone@UTA.CI")
    assert user.email == "awa.kone@uta.ci"


def test_email_unique_sans_distinction_de_casse(make_user):
    make_user("awa@uta.ci")
    with pytest.raises(IntegrityError), transaction.atomic():
        make_user("AWA@uta.ci")


def test_etudiant_approuve_professeur_en_attente(make_user):
    assert make_user("e@uta.ci").is_approved is True
    assert make_user("p@uta.ci", role="professeur").is_approved is False


def test_superuser_est_admin_approuve_et_staff(db):
    admin = User.objects.create_superuser("root@uta.ci", "motdepasse123", nom="A", prenom="B")
    assert admin.role == "admin" and admin.is_approved and admin.is_staff


def test_etudiant_exige_filiere_et_niveau(filiere, db):
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user("x@uta.ci", "motdepasse123", role="etudiant", filiere=filiere)


def test_seul_un_etudiant_a_un_niveau(make_user):
    with pytest.raises(IntegrityError), transaction.atomic():
        make_user("p@uta.ci", role="professeur", niveau="L2")  # niveau ignoré par la fixture
        User.objects.filter(email="p@uta.ci").update(niveau="L2")


def test_regle_jwt_refuse_compte_inactif_ou_non_approuve(make_user):
    actif = make_user("a@uta.ci")
    assert user_authentication_rule(actif) is True
    actif.is_active = False
    assert user_authentication_rule(actif) is False
    prof = make_user("p@uta.ci", role="professeur")
    assert user_authentication_rule(prof) is False
