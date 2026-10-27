import { useState } from 'react'
import { GraduationCap, Plus, Pencil, Power } from 'lucide-react'
import { academics, admin } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useAsync, EmptyState, ErrorBox, Modal, PageHeader, Spinner } from '../../components/ui'

const EMPTY = { code: '', nom: '', description: '' }

export default function AdminFilieres() {
  const toast = useToast()
  const { data: filieres, loading, error, reload } = useAsync(() => academics.filieres(), [])
  const [editing, setEditing] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    try { await admin.saveFiliere(editing); toast('Filière enregistrée.'); setEditing(null); reload() }
    catch (err) { toast(err.message, 'error') }
  }
  const toggle = async (f) => {
    try { await admin.saveFiliere({ id: f.id, is_active: !f.is_active }); reload() }
    catch (err) { toast(err.message, 'error') }
  }
  const set = (k) => (e) => setEditing((v) => ({ ...v, [k]: e.target.value }))

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Filières" subtitle="Les filières proposées aux étudiants à l’inscription."
        actions={<button className="btn-primary" onClick={() => setEditing(EMPTY)}><Plus className="size-4" /> Nouvelle filière</button>} />
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !filieres?.length ? (
        <EmptyState icon={GraduationCap} title="Aucune filière" text="Créez la première filière." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filieres.map((f) => (
            <div key={f.id} className="card p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-uta text-sm font-bold text-white">{f.code}</span>
                <span className={`badge ${f.is_active ? 'bg-uta-50 text-uta' : 'bg-slate-100 text-ardoise'}`}>{f.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 className="mt-3 font-extrabold">{f.nom}</h3>
              <p className="mt-1 text-sm text-ardoise">{f.description}</p>
              <p className="mt-3 text-xs font-semibold text-ardoise">{f.modules_count} module{f.modules_count !== 1 ? 's' : ''}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary !py-1.5" onClick={() => setEditing(f)}><Pencil className="size-4" /> Modifier</button>
                <button className="btn-ghost !py-1.5" onClick={() => toggle(f)}><Power className="size-4" /> {f.is_active ? 'Désactiver' : 'Activer'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Modifier la filière' : 'Nouvelle filière'} id="filiere-modal">
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div><label className="label" htmlFor="f-code">Code</label><input id="f-code" className="input" required value={editing.code} onChange={set('code')} /></div>
            <div><label className="label" htmlFor="f-nom">Nom</label><input id="f-nom" className="input" required value={editing.nom} onChange={set('nom')} /></div>
            <div><label className="label" htmlFor="f-desc">Description</label><textarea id="f-desc" className="input" value={editing.description} onChange={set('description')} /></div>
            <button className="btn-primary w-full" type="submit">Enregistrer</button>
          </form>
        )}
      </Modal>
    </div>
  )
}
