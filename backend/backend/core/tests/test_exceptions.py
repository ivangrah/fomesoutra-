from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView

from core.exceptions import BusinessError

factory = APIRequestFactory()


class Protegee(APIView):  # permissions par défaut
    def get(self, request):
        return Response({})


class Invalide(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raise ValidationError({"titre": ["Ce champ est obligatoire."]})


class Metier(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        raise BusinessError("Ce document n'accepte pas de rendu.", code="not_a_devoir", status_code=409)


def test_non_authentifie_renvoie_detail_et_code():
    response = Protegee.as_view()(factory.get("/"))
    assert response.status_code == 401
    assert response.data["code"] == "not_authenticated"
    assert isinstance(response.data["detail"], str)


def test_validation_renvoie_detail_code_et_erreurs_par_champ():
    response = Invalide.as_view()(factory.post("/", {}))
    assert response.status_code == 400
    assert response.data["code"] == "validation_error"
    assert response.data["detail"] == "Ce champ est obligatoire."
    assert response.data["errors"] == {"titre": ["Ce champ est obligatoire."]}


def test_erreur_metier_garde_son_code_et_son_statut():
    response = Metier.as_view()(factory.get("/"))
    assert response.status_code == 409
    assert response.data == {"detail": "Ce document n'accepte pas de rendu.", "code": "not_a_devoir"}
