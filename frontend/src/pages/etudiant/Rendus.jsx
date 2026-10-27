import { Link } from 'react-router-dom'
import { Inbox, ArrowUpRight } from 'lucide-react'
import { submissions } from '../../services/api'
import { useAsync, EmptyState, Spinner, PageHeader } from '../../components/ui'
import { formatDateTime, formatSize } from '../../lib/format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

export default function EtudiantRendus() {
  const { data: list, loading } = useAsync(() => submissions.list(), [])

  return (
    <div>
      <PageHeader
        eyebrow="Espace étudiant"
        title="Mes rendus"
        subtitle="Historique de tous vos dépôts."
      />
      {loading ? <Spinner /> : !list?.length ? (
        <EmptyState icon={Inbox} title="Aucun rendu"
          text="Vous n'avez encore rien soumis. Consultez vos modules pour voir les devoirs ouverts."
          action={<Link to="/etudiant/modules" className="btn-primary">Voir mes modules</Link>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-ligne">
            {list.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4 hover:bg-casse/60 transition">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{s.resource_detail?.titre}</p>
                  <p className="text-xs text-ardoise mt-0.5">
                    {s.resource_detail?.module_detail?.code} · Déposé le {formatDateTime(s.submitted_at)}
                  </p>
                  {s.commentaire && (
                    <p className="mt-1 text-xs text-ardoise italic">"{s.commentaire}"</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`badge ${s.is_late ? 'bg-red-50 text-red-700' : 'bg-uta-50 text-uta'}`}>
                    {s.is_late ? <><FontAwesomeIcon icon={faTriangleExclamation} /> En retard</> : <><FontAwesomeIcon icon={faCircleCheck} /> Dans les délais</>}
                  </span>
                  <span className="text-xs text-ardoise">{formatSize(s.fichier?.size ?? 0)}</span>
                </div>
                <Link to={`/etudiant/modules/${s.resource_detail?.module}`}
                  className="btn-ghost !p-2 shrink-0" title="Voir le module">
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
