/**
 * Couche d'accès aux données.
 *
 * En V1 front-end, toutes les fonctions s'appuient sur une "fausse API" persistée
 * dans le localStorage (données de démo : src/data/mock.js).
 * Chaque fonction indique l'endpoint Django REST Framework correspondant :
 * il suffira de remplacer le corps par un appel `http(...)` pour brancher le back-end.
 */
import * as seed from '../data/mock'

const STORE_KEY = 'savoirplus.db.v1'
const TOKEN_KEY = 'savoirplus.token'
export const MAX_UPLOAD_MB = 50
export const EMAIL_DOMAIN = seed.EMAIL_DOMAIN

/* ------------------------------------------------------------------ */
/* Client HTTP (prêt pour le back-end, non utilisé en mode démo)       */
/* ------------------------------------------------------------------ */
const API_URL = import.meta.env.VITE_API_URL // ex : http://localhost:8000/api

// eslint-disable-next-line no-unused-vars
async function http(path, { method = 'GET', body, isForm = false } = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isForm ? body : body && JSON.stringify(body),
  })
  if (!res.ok) throw new ApiError((await res.json().catch(() => ({}))).detail || 'Erreur réseau', res.status)
  return res.status === 204 ? null : res.json()
}

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

/* ------------------------------------------------------------------ */
/* Base locale de démonstration                                        */
/* ------------------------------------------------------------------ */
function load() {
  const raw = localStorage.getItem(STORE_KEY)
  if (raw) return JSON.parse(raw)
  const db = structuredClone({
    filieres: seed.filieres,
    users: seed.users,
    modules: seed.modules,
    resources: seed.resources,
    submissions: seed.submissions,
    downloads: seed.downloads,
  })
  localStorage.setItem(STORE_KEY, JSON.stringify(db))
  return db
}
const save = (db) => localStorage.setItem(STORE_KEY, JSON.stringify(db))
const nextId = (list) => Math.max(0, ...list.map((x) => x.id)) + 1
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const publicUser = ({ password, ...u }) => u // eslint-disable-line no-unused-vars

export function resetDemo() {
  localStorage.removeItem(STORE_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

function currentUser(db) {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new ApiError('Non authentifié', 401)
  const id = Number(token.replace('demo-token-', ''))
  const u = db.users.find((x) => x.id === id)
  if (!u) throw new ApiError('Session expirée', 401)
  return u
}

/* Modules visibles selon le rôle (cahier des charges : accès restreint au module) */
function visibleModules(db, user) {
  const active = db.modules.filter((m) => m.is_active)
  if (user.role === 'admin') return db.modules
  if (user.role === 'professeur') return active.filter((m) => m.professeurs.includes(user.id))
  return active.filter((m) => m.filiere === user.filiere && m.niveau === user.niveau)
}

function enrichResource(db, r, user) {
  const mod = db.modules.find((m) => m.id === r.module)
  const auteur = db.users.find((u) => u.id === r.auteur)
  const subs = db.submissions.filter((s) => s.resource === r.id)
  return {
    ...r,
    module_detail: mod && { id: mod.id, code: mod.code, nom: mod.nom, couleur: mod.couleur },
    auteur_nom: auteur ? `${auteur.prenom} ${auteur.nom}` : '—',
    submissions_count: subs.length,
    my_submission: user?.role === 'etudiant' ? subs.find((s) => s.etudiant === user.id) || null : undefined,
  }
}

/* ------------------------------------------------------------------ */
/* Authentification — /api/auth/*                                      */
/* ------------------------------------------------------------------ */
export const auth = {
  /** POST /api/auth/token/ */
  async login(email, password) {
    await delay(400)
    const db = load()
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u || u.password !== password) throw new ApiError('E-mail ou mot de passe incorrect.')
    if (!u.is_active) throw new ApiError('Ce compte a été désactivé. Contactez l’administration.')
    if (!u.is_approved) throw new ApiError('Votre compte professeur est en attente de validation par l’administration.')
    localStorage.setItem(TOKEN_KEY, `demo-token-${u.id}`)
    return publicUser(u)
  },

  /**
   * POST /api/auth/google/ — connexion avec Google.
   * Prod : le back-end reçoit le `credential` (ID token Google), le vérifie
   * (signature, audience, `email_verified`, domaine) puis renvoie ses propres jetons.
   * Démo : on décode le jeton côté client SANS le vérifier, ou on accepte un `email`
   * choisi dans le sélecteur de comptes de démonstration.
   */
  async loginWithGoogle({ credential, email: picked }) {
    await delay(400)
    let email = picked
    if (credential) {
      const b64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(decodeURIComponent(escape(atob(b64))))
      if (!payload.email_verified) throw new ApiError('Votre adresse Google n’est pas vérifiée.')
      email = payload.email
    }
    email = (email || '').trim().toLowerCase()
    if (!email.endsWith(`@${EMAIL_DOMAIN}`)) throw new ApiError(`Seuls les comptes Google @${EMAIL_DOMAIN} sont acceptés.`)
    const db = load()
    const u = db.users.find((x) => x.email.toLowerCase() === email)
    if (!u) throw new ApiError('Aucun compte SavoirPlus pour cette adresse. Créez d’abord votre compte.', 404)
    if (!u.is_active) throw new ApiError('Ce compte a été désactivé. Contactez l’administration.')
    if (!u.is_approved) throw new ApiError('Votre compte professeur est en attente de validation par l’administration.')
    localStorage.setItem(TOKEN_KEY, `demo-token-${u.id}`)
    return publicUser(u)
  },

  /** Démo uniquement : comptes proposés dans le faux sélecteur Google */
  googleDemoAccounts() {
    return load().users.filter((u) => u.is_active).map((u) => ({ email: u.email, name: `${u.prenom} ${u.nom}`, role: u.role }))
  },

  /** POST /api/auth/register/ */
  async register(data) {
    await delay(500)
    const db = load()
    const email = data.email.trim().toLowerCase()
    if (!email.endsWith(`@${EMAIL_DOMAIN}`)) throw new ApiError(`Seules les adresses @${EMAIL_DOMAIN} sont acceptées.`)
    if (db.users.some((u) => u.email === email)) throw new ApiError('Un compte existe déjà avec cette adresse.')
    const user = {
      id: nextId(db.users),
      nom: data.nom.trim(),
      prenom: data.prenom.trim(),
      email,
      password: data.password,
      role: data.role,
      filiere: Number(data.filiere),
      niveau: data.role === 'etudiant' ? data.niveau : null,
      is_active: true,
      is_approved: data.role === 'etudiant',
      date_joined: new Date().toISOString(),
    }
    db.users.push(user)
    save(db)
    return publicUser(user)
  },

  /** GET /api/auth/me/ */
  async me() {
    await delay(100)
    return publicUser(currentUser(load()))
  },

  /** PATCH /api/auth/me/ */
  async updateMe(patch) {
    await delay(300)
    const db = load()
    const u = currentUser(db)
    Object.assign(u, { nom: patch.nom ?? u.nom, prenom: patch.prenom ?? u.prenom })
    save(db)
    return publicUser(u)
  },

  /** POST /api/auth/change-password/ */
  async changePassword(oldPwd, newPwd) {
    await delay(300)
    const db = load()
    const u = currentUser(db)
    if (u.password !== oldPwd) throw new ApiError('Mot de passe actuel incorrect.')
    u.password = newPwd
    save(db)
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
  },
  hasToken: () => !!localStorage.getItem(TOKEN_KEY),
}

/* ------------------------------------------------------------------ */
/* Filières & modules — /api/filieres/, /api/modules/                  */
/* ------------------------------------------------------------------ */
export const academics = {
  /** GET /api/filieres/ (public : utile au formulaire d'inscription) */
  async filieres({ activeOnly = false } = {}) {
    await delay(100)
    const db = load()
    return db.filieres
      .filter((f) => !activeOnly || f.is_active)
      .map((f) => ({ ...f, modules_count: db.modules.filter((m) => m.filiere === f.id).length }))
  },

  /** GET /api/modules/ */
  async modules() {
    await delay()
    const db = load()
    const user = currentUser(db)
    return visibleModules(db, user).map((m) => ({
      ...m,
      filiere_detail: db.filieres.find((f) => f.id === m.filiere),
      professeurs_detail: m.professeurs.map((pid) => {
        const p = db.users.find((u) => u.id === pid)
        return p && { id: p.id, nom: `${p.prenom} ${p.nom}` }
      }).filter(Boolean),
      resources_count: db.resources.filter((r) => r.module === m.id).length,
      upcoming_count: db.resources.filter((r) => r.module === m.id && r.date_limite && new Date(r.date_limite) > new Date()).length,
    }))
  },

  /** GET /api/modules/:id/ */
  async module(id) {
    const list = await academics.modules()
    const m = list.find((x) => x.id === Number(id))
    if (!m) throw new ApiError('Module introuvable ou accès non autorisé.', 404)
    return m
  },
}

/* ------------------------------------------------------------------ */
/* Ressources & rendus — /api/resources/, /api/submissions/            */
/* ------------------------------------------------------------------ */
export const resources = {
  /** GET /api/resources/?module=&type= */
  async list({ module, type } = {}) {
    await delay()
    const db = load()
    const user = currentUser(db)
    const allowed = new Set(visibleModules(db, user).map((m) => m.id))
    return db.resources
      .filter((r) => allowed.has(r.module))
      .filter((r) => !module || r.module === Number(module))
      .filter((r) => !type || r.type === type)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((r) => enrichResource(db, r, user))
  },

  /** GET /api/resources/upcoming/ — devoirs & examens à venir */
  async upcoming() {
    const all = await resources.list()
    return all
      .filter((r) => r.date_limite && new Date(r.date_limite) > new Date())
      .sort((a, b) => new Date(a.date_limite) - new Date(b.date_limite))
  },

  /** POST /api/resources/ (multipart) */
  async create({ titre, description, type, module, date_limite, file }) {
    await delay(700)
    const db = load()
    const user = currentUser(db)
    const mod = db.modules.find((m) => m.id === Number(module))
    if (!mod || (user.role !== 'admin' && !mod.professeurs.includes(user.id)))
      throw new ApiError('Vous n’êtes pas rattaché à ce module.', 403)
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new ApiError(`Fichier trop volumineux (max ${MAX_UPLOAD_MB} Mo).`)
    const r = {
      id: nextId(db.resources),
      titre, description, type,
      module: mod.id,
      auteur: user.id,
      fichier: { name: file.name, size: file.size },
      created_at: new Date().toISOString(),
      date_limite: type === 'cours' ? null : new Date(date_limite).toISOString(),
    }
    db.resources.push(r)
    save(db)
    return enrichResource(db, r, user)
  },

  /** DELETE /api/resources/:id/ */
  async remove(id) {
    await delay(300)
    const db = load()
    const user = currentUser(db)
    const r = db.resources.find((x) => x.id === id)
    if (!r || (user.role !== 'admin' && r.auteur !== user.id)) throw new ApiError('Action non autorisée.', 403)
    db.resources = db.resources.filter((x) => x.id !== id)
    db.submissions = db.submissions.filter((s) => s.resource !== id)
    save(db)
  },

  /** GET /api/resources/:id/download/ — journalise le téléchargement */
  async download(r) {
    await delay(150)
    const db = load()
    const user = currentUser(db)
    db.downloads.push({ id: nextId(db.downloads), resource: r.id, user: user.id, at: new Date().toISOString() })
    save(db)
    // En démo, on génère un petit fichier texte à la place du vrai document.
    const blob = new Blob([`SavoirPlus — ${r.titre}\n\nFichier de démonstration : ${r.fichier.name}\n`], { type: 'text/plain' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${r.fichier.name}.txt` })
    a.click()
    URL.revokeObjectURL(a.href)
  },
}

export const submissions = {
  /** GET /api/submissions/ — étudiant : ses rendus ; prof : rendus de ses devoirs */
  async list({ resource } = {}) {
    await delay()
    const db = load()
    const user = currentUser(db)
    let list = db.submissions
    if (user.role === 'etudiant') list = list.filter((s) => s.etudiant === user.id)
    if (user.role === 'professeur') {
      const mine = new Set(db.resources.filter((r) => db.modules.find((m) => m.id === r.module)?.professeurs.includes(user.id)).map((r) => r.id))
      list = list.filter((s) => mine.has(s.resource))
    }
    if (resource) list = list.filter((s) => s.resource === Number(resource))
    return list
      .map((s) => {
        const r = db.resources.find((x) => x.id === s.resource)
        const e = db.users.find((u) => u.id === s.etudiant)
        return {
          ...s,
          resource_detail: r && enrichResource(db, r, user),
          etudiant_nom: e ? `${e.prenom} ${e.nom}` : '—',
          etudiant_email: e?.email,
          is_late: r?.date_limite ? new Date(s.submitted_at) > new Date(r.date_limite) : false,
        }
      })
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
  },

  /** POST /api/submissions/ (multipart) — remplace le rendu précédent */
  async submit({ resource, file, commentaire }) {
    await delay(700)
    const db = load()
    const user = currentUser(db)
    const r = db.resources.find((x) => x.id === resource)
    if (!r || r.type !== 'devoir') throw new ApiError('Ce document n’accepte pas de rendu.')
    if (new Date(r.date_limite) < new Date()) throw new ApiError('La date limite est dépassée.')
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new ApiError(`Fichier trop volumineux (max ${MAX_UPLOAD_MB} Mo).`)
    db.submissions = db.submissions.filter((s) => !(s.resource === resource && s.etudiant === user.id))
    const s = { id: nextId(db.submissions), resource, etudiant: user.id, fichier: { name: file.name, size: file.size }, commentaire, submitted_at: new Date().toISOString() }
    db.submissions.push(s)
    save(db)
    return s
  },
}

export const history = {
  /** GET /api/auth/me/history/ — téléchargements de l'utilisateur */
  async downloads() {
    await delay()
    const db = load()
    const user = currentUser(db)
    return db.downloads
      .filter((d) => d.user === user.id)
      .map((d) => ({ ...d, resource_detail: db.resources.find((r) => r.id === d.resource) }))
      .filter((d) => d.resource_detail)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
  },
}

/* ------------------------------------------------------------------ */
/* Back-office — /api/admin/*                                          */
/* ------------------------------------------------------------------ */
function requireAdmin(db) {
  const u = currentUser(db)
  if (u.role !== 'admin') throw new ApiError('Accès réservé à l’administration.', 403)
  return u
}

export const admin = {
  /** GET /api/admin/stats/ */
  async stats() {
    await delay()
    const db = load()
    requireAdmin(db)
    const count = (role) => db.users.filter((u) => u.role === role).length
    return {
      etudiants: count('etudiant'),
      professeurs: count('professeur'),
      pending: db.users.filter((u) => !u.is_approved).length,
      modules: db.modules.filter((m) => m.is_active).length,
      filieres: db.filieres.filter((f) => f.is_active).length,
      resources: db.resources.length,
      submissions: db.submissions.length,
      by_type: ['cours', 'devoir', 'examen'].map((t) => ({ type: t, count: db.resources.filter((r) => r.type === t).length })),
      by_module: db.modules.map((m) => ({ code: m.code, nom: m.nom, count: db.resources.filter((r) => r.module === m.id).length })),
    }
  },

  /** GET /api/admin/users/ */
  async users() {
    await delay()
    const db = load()
    requireAdmin(db)
    return db.users.map(publicUser).sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined))
  },

  /** PATCH /api/admin/users/:id/ */
  async updateUser(id, patch) {
    await delay(250)
    const db = load()
    const me = requireAdmin(db)
    const u = db.users.find((x) => x.id === id)
    if (u.id === me.id && (patch.role || patch.is_active === false)) throw new ApiError('Vous ne pouvez pas modifier votre propre rôle ou statut.')
    Object.assign(u, patch)
    save(db)
    return publicUser(u)
  },

  /** POST/PATCH /api/admin/filieres/ */
  async saveFiliere(data) {
    await delay(300)
    const db = load()
    requireAdmin(db)
    if (data.id) Object.assign(db.filieres.find((f) => f.id === data.id), data)
    else db.filieres.push({ ...data, id: nextId(db.filieres), is_active: true })
    save(db)
  },

  /** POST/PATCH /api/admin/modules/ */
  async saveModule(data) {
    await delay(300)
    const db = load()
    requireAdmin(db)
    const clean = { ...data, filiere: Number(data.filiere), professeurs: data.professeurs.map(Number) }
    if (data.id) Object.assign(db.modules.find((m) => m.id === data.id), clean)
    else db.modules.push({ ...clean, id: nextId(db.modules), is_active: true })
    save(db)
  },

  /** GET /api/admin/resources/ */
  async resources() {
    await delay()
    const db = load()
    const user = requireAdmin(db)
    return db.resources
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((r) => enrichResource(db, r, user))
  },
}
