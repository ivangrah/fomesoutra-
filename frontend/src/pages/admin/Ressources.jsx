import { useState } from 'react'
import { FolderOpen, Search, Trash2 } from 'lucide-react'
import { admin, resources } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useAsync, EmptyState, ErrorBox, FileIcon, PageHeader, Spinner, TypeBadge, Tabs } from '../../components/ui'
import { formatDate, formatSize } from '../../lib/format'

export default function AdminRessources() {
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(() => admin.resources(), [])
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')

  const list = data || []
  const filtered = list
    .filter((r) => !type || r.type === type)
    .filter((r) => !search || `${r.titre} ${r.module_detail?.code} ${r.auteur_nom}`.toLowerCase().includes(search.toLowerCase()))

  const remove = async (r) => {
    if (!confirm(`Supprimer « ${r.titre} » et ses rendus ?`)) return
    try { await resources.remove(r.id); toast('Ressource supprimée.'); reload() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Ressources" subtitle="Toutes les ressources publiées sur la plateforme." />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={type} onChange={setType} tabs={[
          { value: '', label: 'Toutes', count: list.length },
          { value: 'cours', label: 'Cours' }, { value: 'devoir', label: 'Devoirs' }, { value: 'examen', label: 'Examens' },
        ]} />
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ardoise/60" />
          <input className="input pl-9" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !filtered.length ? (
        <EmptyState icon={FolderOpen} title="Aucune ressource" text="Aucune ressource ne correspond à ce filtre." />
      ) : (
        <div className="card divide-y divide-ligne overflow-hidden">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4">
              <FileIcon name={r.fichier.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.titre}</p>
                <p className="truncate text-xs text-ardoise">
                  {r.module_detail?.code} · {r.auteur_nom} · {formatDate(r.created_at)} · {formatSize(r.fichier.size)} · {r.submissions_count} rendu{r.submissions_count !== 1 ? 's' : ''}
                </p>
              </div>
              <TypeBadge type={r.type} />
              <button className="btn-danger !p-2" onClick={() => remove(r)} aria-label={`Supprimer ${r.titre}`}><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
