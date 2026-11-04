def user_authentication_rule(user):
    """Règle SimpleJWT appliquée à l'émission d'un jeton : compte actif et approuvé."""
    return bool(user is not None and user.is_active and user.is_approved)
