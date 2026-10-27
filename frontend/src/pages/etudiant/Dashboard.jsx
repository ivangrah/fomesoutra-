import { Link } from 'react-router-dom'
import { CalendarClock, BookOpen, Inbox, ArrowRight, Download, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { resources, submissions } from '../../services/api'
import { useAsync, StatCard, EmptyState, Spinner, TypeBadge, DeadlineBadge } from '../../components/ui'
import { PageHeader } from '../../components/ui'
import { formatDate, formatDateTime } from '../../lib/format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

export default function EtudiantDashboard() {
  const { user } = useAuth()
  const { data: upcoming, loading: ul } = useAsync(() => resources.upcoming(), [])
  const { data: mySubmissions, loading: sl } = useAsync(() => submissions.list(), [])

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div>
      <PageHeader
        eyebrow={<>{greet()}, {user.prenom} <FontAwesomeIcon icon={faHand} className="ml-1 text-amber-500" /></>}
        title="Mon tableau de bord"
        subtitle="Vos prochaines échéances et activités récentes."
      />

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarClock} label="Échéances à venir"
          value={ul ? '…' : (upcoming?.length ?? 0)} tone="violet" delay={0} />
        <StatCard icon={Inbox} label="Rendus déposés"
          value={sl ? '…' : (mySubmissions?.length ?? 0)} tone="uta" delay={80} />
        <StatCard icon={Download} label="Téléchargements"
          value="—" tone="ardoise" delay={160} hint="Bientôt" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        {/* Échéances */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-encre">Prochaines échéances</h2>
            <Link to="/etudiant/modules" className="text-sm font-semibold text-uta hover:underline flex items-center gap-1">
              Tous les modules <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {ul ? <Spinner /> : !upcoming?.length ? (
            <EmptyState icon={CalendarClock} title="Aucune échéance" text="Vous n'avez pas de devoir ou d'examen à venir." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((r) => {
                const sub = mySubmissions?.find((s) => s.resource === r.id)
                return (
                  <Link key={r.id} to={`/etudiant/modules/${r.module}`}
                    className="card card-hover flex items-center gap-4 p-4 transition">
                    <span className="h-12 w-1.5 shrink-0 rounded-full"
                      style={{ background: r.module_detail?.couleur || '#1E7B34' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ardoise">{r.module_detail?.code}</p>
                      <p className="truncate font-semibold">{r.titre}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ardoise">
                        <Clock className="size-3" /> {formatDate(r.date_limite)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <TypeBadge type={r.type} />
                      <DeadlineBadge date={r.date_limite} submitted={!!sub} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Rendus récents */}
        <section>
          <h2 className="mb-4 font-extrabold text-encre">Mes rendus récents</h2>
          {sl ? <Spinner /> : !mySubmissions?.length ? (
            <EmptyState icon={Inbox} title="Aucun rendu"
              text="Vous n'avez encore rien soumis."
              action={<Link to="/etudiant/modules" className="btn-primary text-sm">Voir les devoirs</Link>} />
          ) : (
            <div className="card divide-y divide-ligne overflow-hidden">
              {mySubmissions.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.resource_detail?.titre}</p>
                    <p className="mt-0.5 text-xs text-ardoise">{formatDateTime(s.submitted_at)}</p>
                  </div>
                  <span className={`badge ${s.is_late ? 'bg-red-50 text-red-700' : 'bg-uta-50 text-uta'}`}>
                    {s.is_late ? 'En retard' : <><FontAwesomeIcon icon={faCircleCheck} /> Déposé</>}
                  </span>
                </div>
              ))}
              {mySubmissions.length > 6 && (
                <div className="p-3 text-center">
                  <Link to="/etudiant/rendus" className="text-sm font-semibold text-uta hover:underline">
                    Voir tout →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
