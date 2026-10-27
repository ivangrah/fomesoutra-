import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FileText, FileType2, Presentation, Sheet, Film, Image, Archive, Code2, File, X, Clock, Loader2,
} from 'lucide-react'
import { fileKind, fromNow, initials, TYPE_LABELS, urgency } from '../lib/format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

/* ---------- Hook de chargement asynchrone ---------- */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true }))
    return fn()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => setState({ data: null, loading: false, error }))
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { run() }, [run])
  return { ...state, reload: run }
}

/* ---------- En-tête de page ---------- */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-fade-up">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-clair">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-encre sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ardoise">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

/* ---------- Carte statistique ---------- */
export function StatCard({ icon: Icon, label, value, tone = 'uta', hint, delay = 0 }) {
  const tones = {
    uta: 'bg-uta-50 text-uta',
    violet: 'bg-violet-50 text-violet',
    clair: 'bg-uta-100 text-profond',
    ardoise: 'bg-slate-100 text-ardoise',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="card card-hover animate-fade-up p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <span className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </span>
        {hint && <span className="text-xs font-medium text-ardoise">{hint}</span>}
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-ardoise">{label}</p>
    </div>
  )
}

/* ---------- Badges ---------- */
export function TypeBadge({ type }) {
  const s = {
    cours: 'bg-uta-50 text-uta ring-uta-100',
    devoir: 'bg-violet-50 text-violet ring-violet-100',
    examen: 'bg-amber-50 text-amber-800 ring-amber-100',
  }[type]
  return <span className={`badge ring-1 ${s}`}>{TYPE_LABELS[type]}</span>
}

export function DeadlineBadge({ date, submitted }) {
  if (submitted) return <span className="badge bg-uta-50 text-uta"><FontAwesomeIcon icon={faCircleCheck} /> Rendu déposé</span>
  const u = urgency(date)
  const s = {
    past: 'bg-slate-100 text-ardoise',
    urgent: 'bg-red-50 text-red-700',
    soon: 'bg-amber-50 text-amber-800',
    later: 'bg-uta-50 text-profond',
  }[u]
  return (
    <span className={`badge ${s}`}>
      <Clock className="size-3" />
      {u === 'past' ? 'Clôturé' : fromNow(date)}
    </span>
  )
}

/* ---------- Icône de fichier ---------- */
const KIND = {
  pdf: [FileText, 'text-red-600 bg-red-50'],
  doc: [FileType2, 'text-blue-700 bg-blue-50'],
  slides: [Presentation, 'text-orange-600 bg-orange-50'],
  sheet: [Sheet, 'text-uta bg-uta-50'],
  video: [Film, 'text-violet bg-violet-50'],
  image: [Image, 'text-pink-600 bg-pink-50'],
  archive: [Archive, 'text-amber-700 bg-amber-50'],
  code: [Code2, 'text-ardoise bg-slate-100'],
  file: [File, 'text-ardoise bg-slate-100'],
}
export function FileIcon({ name, className = 'size-11' }) {
  const [Icon, s] = KIND[fileKind(name)]
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl ${s} ${className}`}>
      <Icon className="size-5" />
    </span>
  )
}

/* ---------- Avatar ---------- */
export function Avatar({ user, size = 'size-9', className = '' }) {
  const bg = { admin: 'bg-violet', professeur: 'bg-profond', etudiant: 'bg-clair' }[user?.role] || 'bg-uta'
  return (
    <span className={`grid shrink-0 place-items-center rounded-full text-xs font-bold text-white ${bg} ${size} ${className}`}>
      {initials(user)}
    </span>
  )
}

/* ---------- États ---------- */
export function Spinner({ label = 'Chargement…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ardoise" role="status">
      <Loader2 className="size-5 animate-spin text-clair" /> {label}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-uta-200 bg-white/60 px-6 py-14 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-uta-50 text-uta"><Icon className="size-6" /></span>
      <h3 className="font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-ardoise">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorBox({ error }) {
  if (!error) return null
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error.message || String(error)}</div>
}

/* ---------- Onglets ---------- */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="inline-flex gap-1 overflow-x-auto rounded-2xl border border-ligne bg-white p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          id={`tab-${t.value}`}
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
            value === t.value ? 'bg-uta text-white shadow-sm' : 'text-ardoise hover:bg-uta-50 hover:text-profond'
          }`}
        >
          {t.label}
          {t.count != null && (
            <span className={`rounded-full px-1.5 text-xs ${value === t.value ? 'bg-white/20' : 'bg-uta-50 text-uta'}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ---------- Modale native <dialog> (light-dismiss + fallback Safari) ---------- */
export function Modal({ open, onClose, title, children, id = 'modal' }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d || 'closedBy' in HTMLDialogElement.prototype) return
    const onClick = (e) => {
      if (e.target !== d) return
      const r = d.getBoundingClientRect()
      const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right
      if (!inside) d.close()
    }
    d.addEventListener('click', onClick)
    return () => d.removeEventListener('click', onClick)
  }, [])

  return (
    <dialog ref={ref} id={id} className="modal" closedby="any" aria-labelledby={`${id}-title`} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-ligne px-6 py-4">
        <h2 id={`${id}-title`} className="text-lg font-bold">{title}</h2>
        <button onClick={() => ref.current?.close()} className="btn-ghost !p-2" aria-label="Fermer">
          <X className="size-5" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{open && children}</div>
    </dialog>
  )
}
