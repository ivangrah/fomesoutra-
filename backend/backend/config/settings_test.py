"""Réglages des tests : variables définies avant l'import des réglages normaux."""
import os

os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("SECURE_SSL_REDIRECT", "0")
os.environ.setdefault("STORAGE_BACKEND", "local")
os.environ.pop("DATABASE_URL", None)

from .settings import *  # noqa: E402,F401,F403
