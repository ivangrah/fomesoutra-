import { useState } from 'react'
import { Inbox, Search } from 'lucide-react'
import { submissions } from '../../services/api'
import { useAsync, EmptyState, Spinner, PageHeader } from '../../components/ui'
import { formatDateTime, formatSize } from '../../lib/format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

export default function ProfRendus() {
  const { data: list, loading } = useAsync(() => submissions.list(), [])
  const [search, setSearch] = useState('')

  const filtered = (list || []).filter((s) => {
    const q = search.toLowerCase()
    return !q ||
      s.etudiant_nom?.toLowerCase().includes(q) ||
      s.resource_detail?.titre?.toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader
        eyebrow="Espace enseignant"
        title="Rendus reçus"
        subtitle="Tous les fichiers déposés par vos étudiants."
      />

      {/* Barre de recherche */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ardoise/60" />
        <input className="input pl-9" placeholder="Rechercher étudiant ou devoir…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner /> : !filtered.length ? (
        <EmptyState icon={Inbox} title="Aucun rendu"
          text={search ? 'Aucun résultat pour cette recherche.' : 'Aucun étudiant n’a encore déposé de rendu.'} />
      ) : (
        <div className="card overflow-hidden">
          {/* En-tête tableau */}
          <div className="hidden grid-cols-[minmax(0,1fr)_80px_110px_80px_80px] gap-4 border-b border-ligne bg-casse px-5 py-3 text-xs font-bold uppercase tracking-wide text-ardoise sm:grid">
            <span>Étudiant / Devoir</span>
            <span>Module</span>
            <span>Déposé le</span>
            <span>Taille</span>
            <span>Statut</span>
          </div>
          <div className="divide-y divide-ligne">
            {filtered.map((s) => (
              <div key={s.id}
                className="flex flex-col gap-2 p-4 hover:bg-casse/50 transition sm:grid sm:grid-cols-[minmax(0,1fr)_80px_110px_80px_80px] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{s.etudiant_nom}</p>
                  <p className="text-xs text-ardoise truncate">{s.resource_detail?.titre}</p>
                  {s.commentaire && (
                    <p className="mt-0.5 text-xs text-ardoise/70 italic truncate">"{s.commentaire}"</p>
                  )}
                </div>
                <p className="text-sm text-ardoise truncate">{s.resource_detail?.module_detail?.code}</p>
                <p className="text-xs text-ardoise">{formatDateTime(s.submitted_at)}</p>
                <p className="text-xs text-ardoise">{formatSize(s.fichier?.size ?? 0)}</p>
                <span className={`badge w-fit ${s.is_late ? 'bg-red-50 text-red-700' : 'bg-uta-50 text-uta'}`}>
                  {s.is_late ? <><FontAwesomeIcon icon={faTriangleExclamation} /> Retard</> : <><FontAwesomeIcon icon={faCircleCheck} /> Ok</>}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-ligne bg-casse px-5 py-3 text-xs text-ardoise">
            {filtered.length} rendu{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
