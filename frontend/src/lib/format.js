/** Utilitaires de formatage (fr-FR) */

export const formatDate = (d, opts = {}) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', ...opts })

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} Ko`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} Mo`
  return `${(bytes / 1024 ** 3).toFixed(1)} Go`
}

const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
export function fromNow(d) {
  const diff = new Date(d) - Date.now()
  const abs = Math.abs(diff)
  const units = [['day', 864e5], ['hour', 36e5], ['minute', 6e4]]
  for (const [u, ms] of units) if (abs >= ms || u === 'minute') return rtf.format(Math.round(diff / ms), u)
}

/** Niveau d'urgence d'une échéance */
export function urgency(deadline) {
  const h = (new Date(deadline) - Date.now()) / 36e5
  if (h < 0) return 'past'
  if (h < 48) return 'urgent'
  if (h < 24 * 7) return 'soon'
  return 'later'
}

export function fileKind(name = '') {
  const ext = name.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'odt', 'txt', 'rtf'].includes(ext)) return 'doc'
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'slides'
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'sheet'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['sql', 'js', 'py', 'java', 'c', 'cpp', 'html', 'css'].includes(ext)) return 'code'
  return 'file'
}

export const ROLE_LABELS = { etudiant: 'Étudiant', professeur: 'Professeur', admin: 'Administrateur' }
export const TYPE_LABELS = { cours: 'Cours', devoir: 'Devoir', examen: 'Examen' }
export const initials = (u) => `${u?.prenom?.[0] ?? ''}${u?.nom?.[0] ?? ''}`.toUpperCase()
