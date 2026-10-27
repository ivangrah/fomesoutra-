import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { academics } from '../../services/api'
import { useAsync, EmptyState, Spinner, PageHeader } from '../../components/ui'

export default function ProfModules() {
  const { data: modules, loading } = useAsync(() => academics.modules(), [])

  return (
    <div>
      <PageHeader
        eyebrow="Espace enseignant"
        title="Mes modules"
        subtitle="Les modules auxquels vous êtes rattaché."
      />
      {loading ? <Spinner /> : !modules?.length ? (
        <EmptyState icon={BookOpen} title="Aucun module"
          text="Vous n'êtes rattaché à aucun module. Contactez l'administration." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Link key={m.id} to={`/professeur/modules/${m.id}`}
              className="card card-hover animate-fade-up block p-5 transition"
              style={{ animationDelay: `${i * 60}ms` }}>
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
                  <span className="badge bg-amber-50 text-amber-800">{m.upcoming_count} actif{m.upcoming_count !== 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-uta">
                Gérer le module <ChevronRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
