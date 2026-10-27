import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Upload, Trash2, Users, CalendarClock } from 'lucide-react'
import { DeadlineBadge, FileIcon, TypeBadge } from './ui'
import { formatDate, formatDateTime, formatSize } from '../lib/format'
import { resources as api } from '../services/api'
import { useToast } from '../context/ToastContext'

/**
 * Ligne/carte de ressource réutilisée par les espaces étudiant, professeur et admin.
 * role : 'etudiant' | 'professeur' | 'admin'
 */
export default function ResourceCard({ r, role, onSubmit, onDelete, showModule = true }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const hasDeadline = r.type !== 'cours' && r.date_limite
  const open = hasDeadline && new Date(r.date_limite) > new Date()

  const download = async () => {
    setBusy(true)
    await api.download(r)
    setBusy(false)
    toast('Téléchargement lancé.')
  }

  return (
    <article className="card card-hover group flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <FileIcon name={r.fichier.name} className="size-12" />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <TypeBadge type={r.type} />
          {showModule && r.module_detail && (
            <span className="text-xs font-semibold text-ardoise">
              <span className="mr-1 inline-block size-2 rounded-full align-middle" style={{ background: r.module_detail.couleur }} />
              {r.module_detail.code} · {r.module_detail.nom}
            </span>
          )}
        </div>
        <h3 className="truncate font-bold text-encre">{r.titre}</h3>
        {r.description && <p className="mt-0.5 line-clamp-2 text-sm text-ardoise">{r.description}</p>}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ardoise/80">
          <span>{r.fichier.name} · {formatSize(r.fichier.size)}</span>
          <span>Publié le {formatDate(r.created_at)} par {r.auteur_nom}</span>
          {hasDeadline && (
            <span className="inline-flex items-center gap-1 font-semibold text-encre">
              <CalendarClock className="size-3.5" /> {r.type === 'examen' ? 'Le' : 'Avant le'} {formatDateTime(r.date_limite)}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        {hasDeadline && <DeadlineBadge date={r.date_limite} submitted={role === 'etudiant' && r.type === 'devoir' && !!r.my_submission} />}
        <div className="flex gap-2">
          <button onClick={download} disabled={busy} className="btn-secondary !px-3" id={`download-${r.id}`} aria-label={`Télécharger ${r.titre}`}>
            <Download className="size-4" /> <span className="hidden md:inline">Télécharger</span>
          </button>
          {role === 'etudiant' && r.type === 'devoir' && open && (
            <button onClick={() => onSubmit?.(r)} className="btn-primary !px-3" id={`submit-${r.id}`}>
              <Upload className="size-4" /> {r.my_submission ? 'Remplacer' : 'Rendre'}
            </button>
          )}
          {role === 'professeur' && r.type === 'devoir' && (
            <Link to={`/professeur/rendus?devoir=${r.id}`} className="btn-secondary !px-3" id={`rendus-${r.id}`}>
              <Users className="size-4" /> {r.submissions_count}
            </Link>
          )}
          {(role === 'professeur' || role === 'admin') && onDelete && (
            <button onClick={() => onDelete(r)} className="btn-danger !px-3" aria-label={`Supprimer ${r.titre}`} id={`delete-${r.id}`}>
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
