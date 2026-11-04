# SavoirPlus — Backend

API Django REST Framework de la plateforme pédagogique UTA. Le frontend React (`../frontend`) est terminé ; ce backend reproduit le contrat que `frontend/src/services/api.js` attend.

## Démarrage local

Python 3.12 ou plus récent.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows : .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env                                    # puis régler SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

`GET http://localhost:8000/api/health/` doit répondre `{"status": "ok"}`.
Tests : `pytest`.

## Ce que contient cette base

- Configuration par variables d'environnement (voir `.env.example`), CORS, JWT, erreurs normalisées `{detail, code, errors}`, pas de pagination.
- Modèles et migrations : utilisateur personnalisé (e-mail), filières, modules, ressources, téléchargements, rendus, avec leurs contraintes en base.
- Règle de visibilité des modules : `Module.objects.visible_to(user)`.
- Permissions de base (`core/permissions.py`), validation des fichiers (`core/files.py`), stockage privé local ou S3.
- Tests : modèles, contraintes, visibilité, format d'erreur, validation de fichiers, refus des comptes désactivés (401) ou non approuvés (403), même avec un jeton encore valide.

Pas encore fait : les endpoints (inscription, connexion, modules, ressources, rendus, admin), les sérializers, l'envoi et le téléchargement de fichiers. Ils se construisent par tranche verticale, en suivant `../CLAUDE.md`.

## Structure

| App | Rôle |
|---|---|
| `core` | Constantes, erreurs, permissions, throttles, validation de fichiers, `health` |
| `accounts` | Utilisateur personnalisé, règle d'authentification JWT |
| `academic` | Filières, modules, visibilité |
| `resources` | Ressources, téléchargements |
| `submissions` | Rendus |
| `administration` | Utilisateurs et statistiques (à venir) |

## Déploiement (Render)

- Build : `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start : `gunicorn config.wsgi`
- Variables : `SECRET_KEY`, `DATABASE_URL` (PostgreSQL), `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (adresse Vercel du front), `STORAGE_BACKEND=s3` et les variables `S3_*`.
- Le disque de Render n'est pas persistant : ne jamais utiliser `STORAGE_BACKEND=local` en production.
- L'admin Django (`/admin/`) est réservé aux superutilisateurs : c'est un outil technique, pas l'espace admin de la plateforme.
