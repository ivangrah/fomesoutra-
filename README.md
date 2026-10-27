# SavoirPlus — Plateforme pédagogique UTA

SavoirPlus centralise les **cours, devoirs, examens et tutoriels** des étudiants de l’**Université de Technologie d’Abidjan (UTA)**, pour toutes les filières et tous les niveaux. Chaque étudiant retrouve les modules de sa filière et de son niveau, consulte les échéances et dépose ses rendus ; les professeurs publient leurs ressources et suivent les dépôts ; l’administration gère filières, modules et comptes.

> **État actuel : V1 front-end (phase pilote).**
> L’interface est complète et fonctionne avec une **API simulée** (données de démonstration stockées dans le navigateur). Le back-end Django REST Framework reste à développer.

---

## Démarrage rapide

**Prérequis :** Node.js 20 ou plus récent (22 recommandé) et npm.

```bash
git clone https://github.com/ivangrah/fomesoutra-UTA.git
cd fomesoutra-UTA/frontend
npm install
npm run dev
```

L’application s’ouvre sur **http://localhost:5173**.

### Comptes de démonstration

Sur la page de connexion, les boutons **Étudiant**, **Professeur** et **Admin** connectent directement. Mot de passe commun : `demo1234`.

| Rôle | E-mail |
|---|---|
| Étudiant | `etudiant@uta.ci` |
| Professeur | `prof@uta.ci` |
| Administrateur | `admin@uta.ci` |

Les données de démo sont enregistrées dans le `localStorage` du navigateur. Pour repartir de zéro, videz le stockage du site `localhost:5173` (outils de développement → Application → Stockage).

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production dans `frontend/dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm run lint` | Analyse du code avec oxlint |

### Variables d’environnement

Copiez `frontend/.env.example` en `frontend/.env` si besoin. Tout est optionnel en mode démo.

| Variable | Rôle |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Identifiant client OAuth Google (type « Application Web »). Vide = sélecteur de comptes de démonstration. |
| `VITE_API_URL` | URL du futur back-end Django REST Framework (non utilisée en mode démo). |

---

## Fonctionnalités

- **Accueil** animé : recherche de modules, présentation des espaces, animations GSAP et défilement fluide.
- **Authentification** : connexion par e-mail `@uta.ci` ou **Continuer avec Google**, inscription étudiant ou enseignant (les comptes enseignants sont validés par l’administration).
- **Espace étudiant** : tableau de bord des échéances, modules de sa filière et de son niveau, téléchargement des ressources, dépôt et historique des rendus.
- **Espace professeur** : publication de cours, devoirs et examens, suivi des rendus reçus (à temps ou en retard).
- **Espace administration** : statistiques, gestion des filières et des modules, validation et désactivation des comptes, supervision des ressources.
- Interface **responsive**, pensée d’abord pour le mobile.

## Stack technique

- **React 19** + **Vite** + **React Router**
- **Tailwind CSS 4**
- Icônes : **Font Awesome** et **Lucide**
- Animations : **GSAP** (+ ScrollTrigger), **Lenis** (scroll fluide), **AutoAnimate** (listes)

## Structure du dépôt

```
frontend/
├── src/
│   ├── pages/            # Accueil, connexion, inscription, profil, détail d’un module
│   │   ├── etudiant/     # Espace étudiant
│   │   ├── professeur/   # Espace professeur
│   │   └── admin/        # Espace administration
│   ├── components/       # Mise en page, logo, cartes, modales, bouton Google, pied de page
│   ├── context/          # Authentification et notifications (toasts)
│   ├── services/api.js   # Couche d’accès aux données (API simulée)
│   ├── data/mock.js      # Données de démonstration
│   ├── lib/format.js     # Dates, tailles de fichiers, libellés
│   └── index.css         # Charte graphique (couleurs, typographie, composants)
└── .env.example
```

## Brancher le back-end

Toutes les données passent par `frontend/src/services/api.js`. Chaque fonction y indique en commentaire l’endpoint Django REST Framework attendu (par exemple `POST /api/auth/token/`, `GET /api/modules/`, `POST /api/submissions/`). Un client `http()` prêt à l’emploi y est déjà défini : pour passer au vrai back-end, il suffit de remplacer le corps de chaque fonction par l’appel HTTP correspondant, sans toucher aux composants.

Points à garantir côté serveur :

- n’accepter que les adresses `@uta.ci` ;
- restreindre l’accès aux modules selon la filière et le niveau de l’étudiant, ou le rattachement du professeur ;
- **vérifier le jeton Google côté serveur** (signature, audience, `email_verified`) : en démo, il est seulement décodé dans le navigateur ;
- limiter la taille des fichiers déposés (50 Mo dans l’interface) et refuser les rendus après la date limite.

## Charte graphique

| Couleur | Code |
|---|---|
| Vert UTA | `#1E7B34` |
| Vert profond | `#166029` |
| Vert clair | `#3FAE5A` |
| Violet ISCAT | `#5B2A86` |
| Gris ardoise | `#4B5563` |
| Blanc cassé | `#F7F8F7` |

Typographie : **Plus Jakarta Sans**.

Règle : les fonds sont **unis**, vert **ou** violet, jamais de dégradé mélangeant les deux.

## Feuille de route

- [x] Front-end V1 : espaces étudiant, professeur et administration
- [x] Page d’accueil animée et connexion Google (mode démo)
- [ ] Back-end Django REST Framework (authentification, modules, ressources, rendus)
- [ ] Stockage réel des fichiers déposés
- [ ] Tests automatisés
- [ ] Tutoriels de l’équipe tutorat
