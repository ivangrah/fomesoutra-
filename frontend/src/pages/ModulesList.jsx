import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search, ArrowUpRight, CalendarClock, FileStack } from 'lucide-react'
import { EmptyState, ErrorBox, PageHeader, Spinner, useAsync } from '../components/ui'
import { academics } from '../services/api'
import { useAuth } from '../context/AuthContext'

/** Liste des modules (étudiant : modules de sa filière/niveau ; prof : modules enseignés) */
export default function ModulesList() {
  const { user } = useAuth()
  const { data, loading, error } = useAsync(() => academics.modules(), [])
  const [q, setQ] = useState('')
  const base = user.role === 'etudiant' ? '/etudiant' : '/professeur'

  const list = (data || []).filter((m) => `${m.code} ${m.nom}`.toLowerCase().includes(q.toLowerCase()))
  const bySemestre = list.reduce((acc, m) => ({ ...acc, [m.semestre]: [...(acc[m.semestre] || []), m] }), {})

  return (
    <>
      <PageHeader
        eyebrow={user.role === 'etudiant' ? `${data?.[0]?.filiere_detail?.code ?? ''} · ${user.niveau}` : 'Enseignement'}
        title="Mes modules"
        subtitle={user.role === 'etudiant' ? 'Les modules de votre filière et de votre niveau.' : 'Les modules auxquels vous êtes rattaché.'}
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ardoise/60" />
            <input type="search" className="input pl-9" placeholder="Rechercher un module…" value={q} onChange={(e) => setQ(e.target.value)} id="module-search" aria-label="Rechercher un module" />
          </div>
        }
      />
      <ErrorBox error={error} />
      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState icon={BookOpen} title="Aucun module" text={q ? 'Aucun module ne correspond à votre recherche.' : 'Aucun module ne vous est encore attribué.'} />
      ) : (
        Object.entries(bySemestre).sort().map(([sem, mods]) => (
          <section key={sem} className="mb-9">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ardoise">Semestre {sem.replace('S', '')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {mods.map((m, i) => (
                <Link key={m.id} to={`${base}/modules/${m.id}`} id={`module-${m.id}`}
                  className="card card-hover group relative animate-fade-up overflow-hidden p-5" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: m.couleur }} />
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl text-sm font-extrabold text-white" style={{ background: m.couleur }}>
                      {m.code.slice(-3)}
                    </span>
                    <ArrowUpRight className="size-5 text-ardoise/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-uta" />
                  </div>
                  <p className="mt-4 text-xs font-bold text-ardoise">{m.code}</p>
                  <h3 className="text-lg font-bold leading-snug">{m.nom}</h3>
                  <p className="mt-1 truncate text-sm text-ardoise">
                    {m.professeurs_detail.length ? m.professeurs_detail.map((p) => p.nom).join(', ') : 'Professeur à définir'}
                  </p>
                  <div className="mt-4 flex gap-4 border-t border-ligne pt-3 text-xs font-semibold text-ardoise">
                    <span className="flex items-center gap-1.5"><FileStack className="size-4 text-clair" /> {m.resources_count} ressources</span>
                    {m.upcoming_count > 0 && <span className="flex items-center gap-1.5 text-violet"><CalendarClock className="size-4" /> {m.upcoming_count} à venir</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
