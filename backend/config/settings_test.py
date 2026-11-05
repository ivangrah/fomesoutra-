"""RÃ©glages des tests : variables dÃ©finies avant l'import des rÃ©glages normaux."""
import os

os.environ.setdefault("SECRET_KEY", "cle-de-test-uniquement-assez-longue-pour-jwt-0123456789")
os.environ.setdefault("SECURE_SSL_REDIRECT", "0")
os.environ.setdefault("STORAGE_BACKEND", "local")
os.environ.pop("DATABASE_URL", None)

from .settings import *  # noqa: E402,F401,F403
