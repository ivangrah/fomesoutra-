from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Limite les tentatives de connexion (débit réglé par THROTTLE_LOGIN)."""

    scope = "login"
