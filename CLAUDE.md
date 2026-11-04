# SavoirPlus — Plateforme pédagogique UTA

Plateforme web qui centralise les cours, devoirs, examens et tutoriels des étudiants de l'Université de Technologie d'Abidjan (UTA). Phase 1 : filière IGL. Trois rôles : étudiant, professeur, admin.

## État du projet

- Frontend React terminé : dépôt GitHub `https://github.com/ivangrah/fomesoutra-.git`, dossier `frontend/`. Il est branché sur une API simulée (`frontend/src/services/api.js`, données dans `frontend/src/data/mock.js`).
- La tâche à faire est le backend Django REST Framework, dans `backend/` (à la racine du même dépôt). Il doit reproduire le contrat que le front consomme déjà.
- La base du backend est créée : configuration, modèles et migrations, socle commun (erreurs, permissions, fichiers) et tests. Les endpoints restent à construire, une tranche verticale à la fois.
- N'écris pas un endpoint dont l'exemple de requête et de réponse JSON n'a pas été validé par l'utilisateur.

## Stack

- Front : React 19, Vite, React Router 7, Tailwind 4.
- Back : Python, Django REST Framework, PostgreSQL, SimpleJWT, stockage objet externe privé.
- Hébergement : Vercel (front), Render (back et base). Domaine Vercel pour l'instant, domaine personnalisé plus tard : CORS et hôtes autorisés via variables d'environnement.

## Sources de vérité (par ordre)

1. Le cahier des charges fourni par l'utilisateur.
2. `frontend/src/services/api.js` : l'endpoint attendu est indiqué en commentaire de chaque fonction.
3. Les composants React : seuls les champs réellement lus comptent.

En cas de conflit entre ces sources, ne tranche pas seul : signale-le et demande.

## Décisions figées (validées par l'utilisateur)

- Les professeurs sont toujours en attente de validation par l'admin.
- Rendu après la date limite : accepté, avec indicateur `is_late`.
- Rendu remplacé : l'ancien est écrasé (une ligne par devoir et par étudiant, ancien fichier supprimé).
- Taille maximale par type de fichier et stockage externe dès la V1.
- Un étudiant voit les modules actifs de sa filière et de son niveau.
- L'admin peut publier une ressource.

## Décisions en attente ou hypothèses à corriger

- Vérification de l'adresse e-mail par lien de confirmation : question ouverte (recommandée).
- Pagination : tableaux simples (hypothèse).
- Connexion Google en V1 ; mot de passe oublié et suppression de compte en V1 mais construits en dernier (hypothèse).
- Valeurs proposées, non validées : rendus 50 Mo, cours 100 Mo, devoirs et examens 50 Mo ; jeton d'accès court (environ 30 minutes) avec jeton de rafraîchissement ; lien externe optionnel sur les cours pour les longues vidéos.
- Aucune clôture définitive des rendus en V1 (hypothèse).

## Modèle de données (résumé)

- **Utilisateur** : e-mail unique sans casse, nom, prénom, rôle, filière, niveau (L1 à L3, étudiants seulement), `is_active`, `is_approved`, `date_joined`.
- **Filière** : code unique, nom, description, `is_active`.
- **Module** : code unique, nom, filière, niveau, semestre (S1 à S6), couleur, `is_active`, professeurs (plusieurs-à-plusieurs, approuvés).
- **Ressource** : titre, description, type (cours, devoir, examen), module, auteur, fichier (clé de stockage, nom d'origine, taille, type détecté), `date_limite` (obligatoire sauf pour un cours), `created_at`.
- **Rendu** : ressource (devoir), étudiant, fichier, commentaire, `submitted_at`, `is_late`. Unique (ressource, étudiant). `is_late` est recalculé à chaque dépôt.
- **Téléchargement** : ressource, utilisateur, date.
- Pas de suppression physique des filières, modules et utilisateurs : désactivation. Une ressource supprimée emporte ses rendus, ses téléchargements et ses fichiers.

## Permissions

Toujours vérifier le rôle et l'objet côté serveur, et filtrer les querysets.

- **Modules** : étudiant (actifs, sa filière et son niveau), professeur (ceux où il est rattaché), admin (tous).
- **Ressources** : voir et télécharger si le module est visible ; publier (professeur dans ses modules actifs, admin dans tout module actif) ; supprimer (auteur ou admin).
- **Rendus** : déposer (étudiant, devoir d'un module visible) ; voir et télécharger (étudiant : les siens, professeur : ceux de ses modules, admin : tous).
- **Admin** : valider, désactiver, réactiver des comptes. Il ne peut pas modifier son propre statut. Seuls `is_approved` et `is_active` sont modifiables.
- Un compte inactif est refusé immédiatement (401), un compte non approuvé aussi (403), même avec un jeton encore valide. La règle SimpleJWT `USER_AUTHENTICATION_RULE` s'applique à la connexion et au rafraîchissement du jeton.

## Contrat API (préfixe `/api/`)

- Auth : `POST auth/register/`, `POST auth/token/`, `POST auth/token/refresh/`, `POST auth/google/`, `GET/PATCH auth/me/`, `POST auth/change-password/`, `GET auth/me/history/`.
- Académique : `GET filieres/` (public, filtre actives), `GET modules/`, `GET modules/:id/`.
- Ressources : `GET resources/?module=&type=`, `GET resources/upcoming/`, `POST resources/` (multipart), `DELETE resources/:id/`, `GET resources/:id/download/`.
- Rendus : `GET submissions/?resource=`, `POST submissions/` (multipart), `GET submissions/:id/download/` (à ajouter).
- Admin : `GET admin/stats/`, `GET admin/users/`, `PATCH admin/users/:id/`, `POST/PATCH admin/filieres/`, `POST/PATCH admin/modules/`, `GET admin/resources/`.
- Technique : `GET health/`.

### Champs que le front lit (ne jamais renommer)

- **Utilisateur** : `id, nom, prenom, email, role, filiere, niveau, is_active, is_approved, date_joined`.
- **Module** : `id, code, nom, niveau, semestre, couleur, is_active, filiere` (id), `filiere_detail.code`, `professeurs` (ids), `professeurs_detail[{id, nom}]`, `resources_count`, `upcoming_count`.
- **Ressource** : `id, titre, description, type, date_limite, created_at`, `module` (id), `module_detail{id, code, nom, couleur}`, `auteur` (id), `auteur_nom`, `fichier{name, size}`, `submissions_count`, `my_submission` (étudiant seulement).
- **Rendu** : `id`, `resource` (id), `resource_detail` (ressource enrichie), `etudiant_nom`, `etudiant_email`, `fichier{name, size}`, `commentaire`, `submitted_at`, `is_late`.
- **Historique de téléchargements** : `at` et `resource_detail.titre`.
- **Stats** : `etudiants, professeurs, pending, modules, filieres, resources, submissions`, `by_type[{type, count}]`, `by_module[{code, nom, count}]`.
- **Erreurs** : `{"detail": "...", "code": "..."}` (le front lit `detail`), plus `errors` par champ pour la validation.
- **Dates** : ISO 8601 en UTC.

## Règles non négociables

- Ne fais jamais confiance au frontend pour les permissions.
- Aucun fichier public : accès par un endpoint contrôlé qui renvoie une URL signée de courte durée.
- Valide taille, extension et type MIME réel. Le nom de stockage est généré côté serveur.
- Aucun secret dans Git : tout passe par des variables d'environnement.
- Ne renomme jamais un champ consommé par le front sans migration coordonnée.
- Ne crée pas d'endpoint sans écran ou besoin métier identifié.
- Utilise des transactions pour les opérations multi-enregistrements et supprime les fichiers après le commit.
- Définis le modèle utilisateur personnalisé dès la première migration.
- Dis toujours quand tu n'as pas ouvert ou testé quelque chose.

## Workflow

Une tranche verticale à la fois : modèle, serializer, permission, vue, test, intégration React. Ne remplace une fonction de `api.js` par un vrai appel que lorsque son endpoint est testé et documenté.

Ordre : 1 fondation (utilisateur, JWT, inscription, connexion, `me`) ; 2 académique ; 3 ressources et stockage ; 4 rendus ; 5 admin et stats ; 6 durcissement (Google, mot de passe oublié, suppression de compte) ; 7 déploiement.

## Conventions

- Interface, messages d'erreur et documentation en français. Les noms de champs de l'API restent ceux du front.
- Commits courts, en français, au présent.
- Front : pas de dégradé mélangeant vert et violet. Vert UTA `#1E7B34`, vert profond `#166029`, vert clair `#3FAE5A`, violet ISCAT `#5B2A86`, police Plus Jakarta Sans.

## Commandes

- Front : `cd frontend && npm install`, puis `npm run dev`, `npm run build`, `npm run lint`.
- Back : `cd backend && pip install -r requirements-dev.txt`, puis `python manage.py migrate`, `python manage.py runserver`, `pytest` (32 tests). Réglages de test : `config/settings_test.py`.

## Dette connue du front à corriger pendant l'intégration

1. Dépôt possible après la date limite (bouton, libellé « Rendre en retard », message).
2. Route `/admin/publier` manquante.
3. Téléchargement authentifié (fichier récupéré avec le jeton) pour ressources et rendus.
4. Boutons de téléchargement des rendus (professeur et étudiant).
5. Jeton d'accès et jeton de rafraîchissement dans `http()` ; la connexion renvoie l'utilisateur.
6. La page des rendus du professeur ignore `?devoir=`.
7. Manque de `try/catch` (suppression dans `ModuleDetail`, mise à jour du profil).
8. Boutons de démonstration sur la page de connexion, filière par défaut codée en dur (`'1'`), `confirm` et `niveau` envoyés à tort à l'inscription d'un professeur.

---

# Agents

Quand l'utilisateur demande un agent par son nom, adopte ce rôle et respecte ses limites. Un agent par responsabilité.

## `contract-auditor` (lecture seule)

- Quand : avant d'implémenter un endpoint, ou après un changement de contrat.
- Fait : compare `api.js` et les composants avec le serializer ou la réponse du backend ; liste les champs manquants, en trop ou renommés.
- Limites : ne modifie aucun fichier. Distingue faits observés, recommandations et hypothèses.

## `permissions-reviewer` (lecture seule + tests)

- Quand : après chaque vue ou serializer qui expose des données.
- Fait : vérifie le rôle, l'objet et le filtrage des querysets ; rejoue les cas : un étudiant lit le rendu d'un autre par l'URL, un professeur publie hors de ses modules, un professeur non approuvé appelle l'API, un compte désactivé réutilise un ancien jeton, un utilisateur télécharge un fichier hors de son périmètre.
- Limites : ne corrige pas, il rapporte.

## `django-builder`

- Quand : implémenter une tranche verticale validée.
- Fait : modèle, migration, serializer, permission, vue et URL pour un seul endpoint à la fois, selon la matrice de permissions de ce fichier.
- Limites : n'ajoute aucun champ ni dépendance sans justification ; n'implémente pas d'endpoint sans contrat validé.

## `api-tester`

- Quand : en même temps que `django-builder`, ou pour verrouiller un contrat.
- Fait : écrit et lance des tests pytest : parcours nominal, refus d'accès, erreurs de validation, forme exacte de la réponse (tests de contrat).
- Limites : un endpoint n'est pas terminé tant que ses refus d'accès ne sont pas testés.

## `frontend-integrator`

- Quand : un endpoint est testé et documenté.
- Fait : remplace le corps d'une fonction de `api.js` par l'appel HTTP, applique les corrections de la dette front concernées, lance `npm run lint` et `npm run build`.
- Limites : ne modifie pas les composants sans expliquer la raison et l'impact ; une fonction à la fois.

---

# Skills

Procédures à suivre quand la tâche correspond.

## `nouvelle-tranche-verticale`

1. Identifie l'écran et l'action front qui consomment l'endpoint (matrice dans `api.js`).
2. Écris un exemple de requête et de réponse JSON réaliste et fais-le valider.
3. Modèle et migration, puis serializer (validation), permission (rôle et objet), vue et URL.
4. Tests : nominal, refus d'accès, validation, forme de la réponse.
5. Lance `permissions-reviewer`, puis `frontend-integrator`.

## `brancher-ecran`

1. Vérifie que l'endpoint est testé et que le contrat est à jour.
2. Remplace uniquement le corps de la fonction de `api.js`, sans changer sa signature ni sa valeur de retour.
3. Gère les erreurs côté composant (chargement, vide, erreur, session expirée).
4. Teste l'écran avec chaque rôle concerné, puis `npm run lint` et `npm run build`.

## `revue-permissions`

1. Liste les endpoints touchés et leurs rôles autorisés (matrice de ce fichier).
2. Pour chacun : authentification, rôle, objet, queryset filtré, compte actif et approuvé.
3. Rejoue les cinq cas d'attaque de `permissions-reviewer`.
4. Rapporte les écarts par priorité (P0 bloquant, P1 avant mise en ligne, P2 amélioration).

## `gestion-fichiers`

1. Valider : taille selon le type, extension autorisée, type MIME réel.
2. Stocker sous une clé générée (identifiant unique) dans un espace privé.
3. Servir par un endpoint qui contrôle l'accès, journalise le téléchargement, puis renvoie une URL signée courte.
4. Remplacement d'un rendu ou suppression d'une ressource : en transaction, puis suppression des fichiers après le commit.
5. Tester qu'une URL de fichier ne reste pas utilisable sans passer par l'endpoint.

## `deploiement-render-vercel`

1. Variables d'environnement : clé secrète, base de données, stockage, origines CORS, hôtes autorisés. Rien dans Git.
2. `GET /api/health/` sans information sensible.
3. Migrations exécutées au déploiement ; sauvegarde de la base et procédure de restauration.
4. Prévoir le premier chargement lent (service Render en veille) dans l'interface.
5. Après un redéploiement, vérifier que les fichiers et les données persistent.
