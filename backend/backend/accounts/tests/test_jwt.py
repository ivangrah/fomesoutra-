from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

factory = APIRequestFactory()


class Protegee(APIView):  # authentification et permissions par défaut
    def get(self, request):
        return Response({"email": request.user.email})


def appel(user):
    jeton = AccessToken.for_user(user)
    return Protegee.as_view()(factory.get("/", HTTP_AUTHORIZATION=f"Bearer {jeton}"))


def test_jeton_valide_d_un_compte_actif(make_user):
    reponse = appel(make_user("e@uta.ci"))
    assert reponse.status_code == 200 and reponse.data["email"] == "e@uta.ci"


def test_jeton_encore_valide_mais_compte_desactive_est_refuse(make_user):
    user = make_user("e@uta.ci")
    jeton = AccessToken.for_user(user)
    user.is_active = False
    user.save()
    reponse = Protegee.as_view()(factory.get("/", HTTP_AUTHORIZATION=f"Bearer {jeton}"))
    assert reponse.status_code == 401


def test_professeur_non_approuve_est_refuse_meme_avec_un_jeton(make_user):
    assert appel(make_user("p@uta.ci", role="professeur")).status_code == 403


def test_professeur_approuve_est_accepte(make_user):
    assert appel(make_user("p@uta.ci", role="professeur", is_approved=True)).status_code == 200
