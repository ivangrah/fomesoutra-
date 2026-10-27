import { Link } from 'react-router-dom'
import { Users, GraduationCap, Layers, FolderOpen, Inbox, UserCheck, ArrowRight } from 'lucide-react'
import { admin } from '../../services/api'
import { useAsync, StatCard, Spinner, ErrorBox, PageHeader } from '../../components/ui'
import { TYPE_LABELS } from '../../lib/format'

export default function AdminDashboard() {
  const { data: s, loading, error } = useAsync(() => admin.stats(), [])
  const max = Math.max(1, ...(s?.by_module || []).map((m) => m.count))

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Vue d’ensemble" subtitle="L’activité de la plateforme SavoirPlus en un coup d’œil." />
      <ErrorBox error={error} />
      {loading ? <Spinner /> : s && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Étudiants" value={s.etudiants} tone="uta" delay={0} />
            <StatCard icon={GraduationCap} label="Professeurs" value={s.professeurs} tone="violet" delay={60} />
            <StatCard icon={Layers} label="Modules actifs" value={s.modules} tone="clair" delay={120} />
            <StatCard icon={FolderOpen} label="Ressources" value={s.resources} tone="uta" delay={180} />
            <StatCard icon={Inbox} label="Rendus déposés" value={s.submissions} tone="violet" delay={240} />
            <StatCard icon={GraduationCap} label="Filières actives" value={s.filieres} tone="clair" delay={300} />
            <StatCard icon={UserCheck} label="Comptes en attente" value={s.pending} tone="amber" delay={360}
              hint={s.pending ? 'À valider' : undefined} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <h2 className="mb-4 font-extrabold">Ressources par module</h2>
              <div className="space-y-3">
                {s.by_module.map((m) => (
                  <div key={m.code}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold">{m.code} <span className="font-normal text-ardoise">· {m.nom}</span></span>
                      <span className="font-bold text-uta">{m.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-uta-50">
                      <div className="h-2 rounded-full bg-uta" style={{ width: `${(m.count / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h2 className="mb-4 font-extrabold">Répartition par type</h2>
              <div className="grid grid-cols-3 gap-3">
                {s.by_type.map((t) => (
                  <div key={t.type} className="rounded-2xl bg-casse p-4 text-center">
                    <p className="text-3xl font-extrabold text-profond">{t.count}</p>
                    <p className="mt-1 text-sm text-ardoise">{TYPE_LABELS[t.type]}</p>
                  </div>
                ))}
              </div>
              {s.pending > 0 && (
                <Link to="/admin/utilisateurs" className="mt-5 flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet">
                  {s.pending} compte{s.pending > 1 ? 's' : ''} professeur en attente de validation
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}
