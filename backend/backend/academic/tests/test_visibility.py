from academic.models import Module


def test_etudiant_voit_sa_filiere_et_son_niveau_modules_actifs(make_user, make_module):
    etudiant = make_user("e@uta.ci", niveau="L2")
    visible = make_module("IGL201")
    make_module("IGL101", niveau="L1")
    make_module("IGL299", is_active=False)
    assert list(Module.objects.visible_to(etudiant)) == [visible]


def test_professeur_ne_voit_que_ses_modules_actifs(make_user, make_module):
    prof = make_user("p@uta.ci", role="professeur")
    mien = make_module("IGL201")
    mien.professeurs.add(prof)
    inactif = make_module("IGL202", is_active=False)
    inactif.professeurs.add(prof)
    make_module("IGL203")
    assert list(Module.objects.visible_to(prof)) == [mien]


def test_admin_voit_tout_y_compris_les_modules_inactifs(make_user, make_module):
    admin = make_user("a@uta.ci", role="admin")
    make_module("IGL201")
    make_module("IGL202", is_active=False)
    assert Module.objects.visible_to(admin).count() == 2


def test_anonyme_ne_voit_rien(make_module):
    from django.contrib.auth.models import AnonymousUser

    make_module("IGL201")
    assert Module.objects.visible_to(AnonymousUser()).count() == 0
