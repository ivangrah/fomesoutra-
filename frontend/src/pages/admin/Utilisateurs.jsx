import { useState } from 'react'
import { Search, Users, Check, Ban, RotateCcw } from 'lucide-react'
import { admin } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useAsync, Avatar, EmptyState, ErrorBox, PageHeader, Spinner, Tabs } from '../../components/ui'
import { formatDate, ROLE_LABELS } from '../../lib/format'

export default function AdminUtilisateurs() {
  const { user: me } = useAuth()
  const toast = useToast()
  const { data: users, loading, error, reload } = useAsync(() => admin.users(), [])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const list = users || []
  const tabs = [
    { value: 'all', label: 'Tous', count: list.length },
    { value: 'pending', label: 'En attente', count: list.filter((u) => !u.is_approved).length },
    { value: 'professeur', label: 'Professeurs', count: list.filter((u) => u.role === 'professeur').length },
    { value: 'etudiant', label: 'Étudiants', count: list.filter((u) => u.role === 'etudiant').length },
  ]
  const filtered = list
    .filter((u) => tab === 'all' || (tab === 'pending' ? !u.is_approved : u.role === tab))
    .filter((u) => !search || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase()))

  const update = async (u, patch, msg) => {
    try { await admin.updateUser(u.id, patch); toast(msg); reload() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Utilisateurs" subtitle="Validez les comptes professeurs et gérez les accès." />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ardoise/60" />
          <input className="input pl-9" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !filtered.length ? (
        <EmptyState icon={Users} title="Aucun utilisateur" text="Aucun compte ne correspond à ce filtre." />
      ) : (
        <div className="card divide-y divide-ligne overflow-hidden">
          {filtered.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar user={u} size="size-10" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{u.prenom} {u.nom}</p>
                  <p className="truncate text-xs text-ardoise">{u.email} · inscrit le {formatDate(u.date_joined)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-uta-50 text-profond">{ROLE_LABELS[u.role]}{u.niveau ? ` · ${u.niveau}` : ''}</span>
                {!u.is_approved && <span className="badge bg-amber-50 text-amber-800">En attente</span>}
                {!u.is_active && <span className="badge bg-red-50 text-red-700">Désactivé</span>}
                {!u.is_approved && (
                  <button className="btn-primary !py-1.5" onClick={() => update(u, { is_approved: true }, 'Compte validé.')}>
                    <Check className="size-4" /> Valider
                  </button>
                )}
                {u.id !== me.id && (u.is_active
                  ? <button className="btn-danger !py-1.5" onClick={() => update(u, { is_active: false }, 'Compte désactivé.')}><Ban className="size-4" /> Désactiver</button>
                  : <button className="btn-secondary !py-1.5" onClick={() => update(u, { is_active: true }, 'Compte réactivé.')}><RotateCcw className="size-4" /> Réactiver</button>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
