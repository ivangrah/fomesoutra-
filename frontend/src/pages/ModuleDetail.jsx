/**
 * Page détail d'un module — partagée entre étudiant, professeur et admin.
 * La prop `role` détermine les actions disponibles.
 */
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FolderOpen, Plus } from 'lucide-react'
import { EmptyState, ErrorBox, Spinner, Tabs, useAsync, PageHeader } from '../components/ui'
import ResourceCard from '../components/ResourceCard'
import SubmitModal from '../components/SubmitModal'
import { academics, resources } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ModuleDetail({ role }) {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const mod = useAsync(() => academics.module(id), [id])
  const res = useAsync(() => resources.list({ module: id }), [id])
  const [tab, setTab] = useState('all')
  const [submitting, setSubmitting] = useState(null)

  const roleBase = {
    etudiant: '/etudiant',
    professeur: '/professeur',
    admin: '/admin',
  }[role || user.role]

  if (mod.loading) return <Spinner />
  if (mod.error)   return <ErrorBox error={mod.error} />
  const m = mod.data
  const list = res.data || []
  const count = (t) => list.filter((r) => r.type === t).length
  const filtered = tab === 'all' ? list : list.filter((r) => r.type === tab)

  const remove = async (r) => {
    if (!confirm(`Supprimer « ${r.titre} » ?`)) return
    await resources.remove(r.id)
    toast('Ressource supprimée.')
    res.reload()
  }

  const canPublish = user.role === 'professeur' || user.role === 'admin'
  const canDelete  = (r) =>
    user.role === 'admin' || (user.role === 'professeur' && r.auteur === user.id)

  return (
    <>
      <Link to={`${roleBase}/modules`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ardoise hover:text-uta transition">
        <ArrowLeft className="size-4" /> Mes modules
      </Link>

      {/* En-tête coloré du module */}
      <header
        className="relative mb-7 overflow-hidden rounded-[var(--radius-card)] p-6 text-white sm:p-8"
        style={{ background: m.couleur }}>
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-white/70">
              {m.code} · {m.filiere_detail?.code} {m.niveau} · {m.semestre}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{m.nom}</h1>
            <p className="mt-2 text-sm text-white/80">
              {m.professeurs_detail?.length
                ? `Enseigné par ${m.professeurs_detail.map((p) => p.nom).join(', ')}`
                : 'Professeur à définir'}
            </p>
          </div>
          {canPublish && (
            <Link to={`${roleBase}/publier?module=${m.id}`}
              className="btn-secondary !border-white/0 self-start shrink-0" id="module-publish">
              <Plus className="size-4" /> Publier dans ce module
            </Link>
          )}
        </div>
      </header>

      {/* Onglets */}
      <div className="mb-5 overflow-x-auto">
        <Tabs value={tab} onChange={setTab} tabs={[
          { value: 'all',    label: 'Tout',    count: list.length },
          { value: 'cours',  label: 'Cours',   count: count('cours') },
          { value: 'devoir', label: 'Devoirs', count: count('devoir') },
          { value: 'examen', label: 'Examens', count: count('examen') },
        ]} />
      </div>

      {/* Liste des ressources */}
      {res.loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Rien pour le moment"
          text="Aucune ressource de ce type n'a encore été publiée dans ce module."
          action={canPublish && (
            <Link to={`${roleBase}/publier?module=${m.id}`} className="btn-primary">
              <Plus className="size-4" /> Publier la première ressource
            </Link>
          )} />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ResourceCard key={r.id} r={r} role={user.role} showModule={false}
              onSubmit={user.role === 'etudiant' ? setSubmitting : undefined}
              onDelete={canDelete(r) ? remove : undefined} />
          ))}
        </div>
      )}

      <SubmitModal resource={submitting} onClose={() => setSubmitting(null)} onDone={res.reload} />
    </>
  )
}
