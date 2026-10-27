import { Link } from 'react-router-dom'
import { BookOpen, Inbox, UploadCloud, ArrowRight, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { resources, submissions } from '../../services/api'
import { useAsync, StatCard, EmptyState, Spinner, TypeBadge, PageHeader } from '../../components/ui'
import { formatDate, formatDateTime } from '../../lib/format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand } from '@fortawesome/free-solid-svg-icons'

export default function ProfDashboard() {
  const { user } = useAuth()
  const { data: myRes,  loading: rl } = useAsync(() => resources.list(), [])
  const { data: mySubs, loading: sl } = useAsync(() => submissions.list(), [])

  const devoirs  = (myRes || []).filter((r) => r.type === 'devoir')
  const examens  = (myRes || []).filter((r) => r.type === 'examen')
  const upcoming = (myRes || [])
    .filter((r) => r.date_limite && new Date(r.date_limite) > new Date())
    .sort((a, b) => new Date(a.date_limite) - new Date(b.date_limite))

  return (
    <div>
      <PageHeader
        eyebrow={<>Bonjour, {user.prenom} <FontAwesomeIcon icon={faHand} className="ml-1 text-amber-500" /></>}
        title="Tableau de bord"
        subtitle="Vos modules et l'activité récente de vos étudiants."
        actions={
          <Link to="/professeur/publier" className="btn-primary" id="dash-publish">
            <UploadCloud className="size-4" /> Publier une ressource
          </Link>
        }
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen}   label="Ressources publiées"  value={rl ? '…' : myRes?.length ?? 0}  tone="uta"    delay={0}   />
        <StatCard icon={Inbox}      label="Rendus reçus"          value={sl ? '…' : mySubs?.length ?? 0}  tone="violet" delay={80}  />
        <StatCard icon={UploadCloud} label="Échéances actives"   value={rl ? '…' : upcoming.length}      tone="clair"  delay={160} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        {/* Échéances actives */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-encre">Devoirs & examens en cours</h2>
            <Link to="/professeur/modules" className="text-sm font-semibold text-uta hover:underline flex items-center gap-1">
              Tous les modules <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {rl ? <Spinner /> : !upcoming.length ? (
            <EmptyState icon={Clock} title="Aucune échéance active" text="Vous n'avez pas de devoir ou d'examen ouvert en ce moment." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((r) => {
                const subCount = mySubs?.filter((s) => s.resource === r.id).length ?? 0
                return (
                  <Link key={r.id} to={`/professeur/modules/${r.module}`}
                    className="card card-hover flex items-center gap-4 p-4 transition">
                    <span className="h-12 w-1.5 shrink-0 rounded-full"
                      style={{ background: r.module_detail?.couleur || '#1E7B34' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ardoise">{r.module_detail?.code}</p>
                      <p className="truncate font-semibold">{r.titre}</p>
                      <p className="mt-0.5 text-xs text-ardoise">
                        Clôture : {formatDate(r.date_limite)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <TypeBadge type={r.type} />
                      <span className="badge bg-violet-50 text-violet">{subCount} rendu{subCount !== 1 ? 's' : ''}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Rendus récents */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-encre">Rendus récents</h2>
            <Link to="/professeur/rendus" className="text-sm font-semibold text-uta hover:underline">Voir tout</Link>
          </div>
          {sl ? <Spinner /> : !mySubs?.length ? (
            <EmptyState icon={Inbox} title="Aucun rendu" text="Aucun étudiant n'a encore déposé de rendu." />
          ) : (
            <div className="card divide-y divide-ligne overflow-hidden">
              {mySubs.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.etudiant_nom}</p>
                    <p className="mt-0.5 truncate text-xs text-ardoise">{s.resource_detail?.titre}</p>
                    <p className="mt-0.5 text-xs text-ardoise">{formatDateTime(s.submitted_at)}</p>
                  </div>
                  <span className={`badge shrink-0 ${s.is_late ? 'bg-red-50 text-red-700' : 'bg-uta-50 text-uta'}`}>
                    {s.is_late ? 'En retard' : 'À temps'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
