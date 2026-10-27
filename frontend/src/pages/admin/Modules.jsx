import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Plus, Pencil, Power, ChevronRight } from 'lucide-react'
import { academics, admin } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { useAsync, EmptyState, ErrorBox, Modal, PageHeader, Spinner } from '../../components/ui'

const COULEURS = ['#1E7B34', '#166029', '#3FAE5A', '#5B2A86']
const EMPTY = { code: '', nom: '', filiere: '', niveau: 'L1', semestre: 'S1', couleur: COULEURS[0], professeurs: [] }

export default function AdminModules() {
  const toast = useToast()
  const { data: modules, loading, error, reload } = useAsync(() => academics.modules(), [])
  const { data: filieres } = useAsync(() => academics.filieres(), [])
  const { data: users } = useAsync(() => admin.users(), [])
  const [editing, setEditing] = useState(null)
  const profs = (users || []).filter((u) => u.role === 'professeur' && u.is_approved)

  const save = async (e) => {
    e.preventDefault()
    try { await admin.saveModule({ ...editing, filiere: editing.filiere || filieres?.[0]?.id }); toast('Module enregistré.'); setEditing(null); reload() }
    catch (err) { toast(err.message, 'error') }
  }
  const toggle = async (m) => {
    try {
      await admin.saveModule({ id: m.id, filiere: m.filiere, professeurs: m.professeurs, is_active: !m.is_active })
      reload()
    } catch (err) { toast(err.message, 'error') }
  }
  const set = (k) => (e) => setEditing((v) => ({ ...v, [k]: e.target.value }))
  const toggleProf = (id) => setEditing((v) => ({
    ...v, professeurs: v.professeurs.includes(id) ? v.professeurs.filter((p) => p !== id) : [...v.professeurs, id],
  }))

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Modules" subtitle="Créez les modules et rattachez-y les professeurs."
        actions={<button className="btn-primary" onClick={() => setEditing(EMPTY)}><Plus className="size-4" /> Nouveau module</button>} />
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !modules?.length ? (
        <EmptyState icon={Layers} title="Aucun module" text="Créez le premier module." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m.id} className={`card p-5 ${m.is_active ? '' : 'opacity-60'}`}>
              <div className="mb-3 flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-2xl text-sm font-bold text-white" style={{ background: m.couleur }}>{m.code.slice(-3)}</span>
                <span className="badge bg-uta-50 text-profond">{m.niveau} · {m.semestre}</span>
              </div>
              <p className="text-xs font-bold text-ardoise">{m.code}</p>
              <h3 className="font-extrabold leading-tight">{m.nom}</h3>
              <p className="mt-2 text-xs text-ardoise">
                {m.professeurs_detail.length ? m.professeurs_detail.map((p) => p.nom).join(', ') : 'Aucun professeur rattaché'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-secondary !py-1.5" onClick={() => setEditing({ id: m.id, code: m.code, nom: m.nom, filiere: m.filiere, niveau: m.niveau, semestre: m.semestre, couleur: m.couleur, professeurs: m.professeurs })}><Pencil className="size-4" /> Modifier</button>
                <button className="btn-ghost !py-1.5" onClick={() => toggle(m)}><Power className="size-4" /> {m.is_active ? 'Désactiver' : 'Activer'}</button>
              </div>
              <Link to={`/admin/modules/${m.id}`} className="mt-3 flex items-center gap-1 text-xs font-semibold text-uta">
                Voir les ressources <ChevronRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Modifier le module' : 'Nouveau module'} id="module-modal">
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="m-code">Code</label><input id="m-code" className="input" required value={editing.code} onChange={set('code')} /></div>
              <div><label className="label" htmlFor="m-niv">Niveau</label>
                <select id="m-niv" className="input" value={editing.niveau} onChange={set('niveau')}>{['L1', 'L2', 'L3'].map((n) => <option key={n}>{n}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="m-nom">Intitulé</label><input id="m-nom" className="input" required value={editing.nom} onChange={set('nom')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="m-fil">Filière</label>
                <select id="m-fil" className="input" value={editing.filiere || filieres?.[0]?.id || ''} onChange={set('filiere')}>
                  {(filieres || []).map((f) => <option key={f.id} value={f.id}>{f.code}</option>)}</select></div>
              <div><label className="label" htmlFor="m-sem">Semestre</label>
                <select id="m-sem" className="input" value={editing.semestre} onChange={set('semestre')}>{['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((n) => <option key={n}>{n}</option>)}</select></div>
            </div>
            <div>
              <span className="label">Couleur</span>
              <div className="flex gap-2">
                {COULEURS.map((c) => (
                  <button type="button" key={c} aria-label={c} onClick={() => setEditing((v) => ({ ...v, couleur: c }))}
                    className={`size-8 cursor-pointer rounded-full ring-offset-2 ${editing.couleur === c ? 'ring-2 ring-encre' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <span className="label">Professeurs</span>
              <div className="space-y-1.5">
                {profs.map((p) => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" className="accent-[#1E7B34]" checked={editing.professeurs.includes(p.id)} onChange={() => toggleProf(p.id)} />
                    {p.prenom} {p.nom}
                  </label>
                ))}
              </div>
            </div>
            <button className="btn-primary w-full" type="submit">Enregistrer</button>
          </form>
        )}
      </Modal>
    </div>
  )
}
