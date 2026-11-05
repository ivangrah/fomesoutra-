from django.db import connection
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health(request):
    """État de l'application, sans information sensible (utile au réveil de Render)."""
    try:
        connection.ensure_connection()
    except Exception:
        return Response({"status": "error"}, status=503)
    return Response({"status": "ok"})
