"""Format d'erreur unique : {"detail": "...", "code": "...", "errors": {...}}.

Le frontend lit `detail` ; `errors` n'existe que pour les erreurs de validation.
"""
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler as drf_exception_handler


class BusinessError(APIException):
    """Erreur métier avec code stable, par exemple BusinessError("...", code="not_a_devoir")."""

    status_code = 400
    default_code = "business_error"

    def __init__(self, detail, code=None, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        super().__init__(detail=detail, code=code)


def _first_message(errors):
    if isinstance(errors, dict):
        for value in errors.values():
            message = _first_message(value)
            if message:
                return message
    elif isinstance(errors, (list, tuple)):
        for value in errors:
            message = _first_message(value)
            if message:
                return message
    elif errors is not None:
        return str(errors)
    return ""


def api_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        return None
    data = response.data
    if isinstance(exc, ValidationError):
        errors = data if isinstance(data, dict) else {"non_field_errors": data}
        response.data = {
            "detail": _first_message(errors) or "Données invalides.",
            "code": "validation_error",
            "errors": errors,
        }
        return response
    detail = data.get("detail") if isinstance(data, dict) else data
    code = getattr(detail, "code", None) or getattr(exc, "default_code", "error")
    response.data = {"detail": str(detail), "code": str(code)}
    return response
