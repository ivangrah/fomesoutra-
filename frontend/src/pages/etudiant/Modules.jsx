import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { academics } from '../../services/api'
import { useAsync, EmptyState, Spinner, PageHeader } from '../../components/ui'

export default function EtudiantModules() {
  const { data: modules, loading } = useAsync(() => academics.modules(), [])

  return (
    <div>
      <PageHeader
        eyebrow="Espace étudiant"
        title="Mes modules"
        subtitle="Tous les modules de votre filière et niveau."
      />
      {loading ? <Spinner /> : !modules?.length ? (
        <EmptyState icon={BookOpen} title="Aucun module" text="Aucun module n'est disponible pour votre filière et niveau." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Link key={m.id} to={`/etudiant/modules/${m.id}`}
              className="card card-hover animate-fade-up block p-5 transition"
              style={{ animationDelay: `${i * 60}ms` }}
              id={`module-${m.id}`}>
              <div className="mb-4 flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-2xl text-white font-bold text-sm"
                  style={{ background: m.couleur }}>
                  {m.code.slice(-3)}
                </span>
                <span className="badge bg-uta-50 text-profond">{m.semestre}</span>
              </div>
              <p className="text-xs font-bold text-ardoise">{m.code}</p>
              <h3 className="mt-1 font-extrabold leading-tight">{m.nom}</h3>
              <div className="mt-3 flex items-center justify-between text-sm text-ardoise">
                <span>{m.resources_count} ressource{m.resources_count !== 1 ? 's' : ''}</span>
                {m.upcoming_count > 0 && (
                  <span className="badge bg-amber-50 text-amber-800">{m.upcoming_count} à venir</span>
                )}
              </div>
              {m.professeurs_detail?.length > 0 && (
                <p className="mt-2 truncate text-xs text-ardoise">
                  {m.professeurs_detail.map(p => p.nom).join(', ')}
                </p>
              )}
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-uta">
                Accéder au module <ChevronRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
