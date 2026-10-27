import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { UploadCloud, ArrowLeft } from 'lucide-react'
import { academics, resources, MAX_UPLOAD_MB } from '../../services/api'
import { useAsync, ErrorBox, Spinner, PageHeader } from '../../components/ui'
import FileDropzone from '../../components/FileDropzone'
import { useToast } from '../../context/ToastContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faPencil, faFileLines } from '@fortawesome/free-solid-svg-icons'

const TYPES = [
  { value: 'cours',  icon: faBookOpen, color: 'text-uta', label: 'Cours',  desc: 'Support de cours, slides, notes…' },
  { value: 'devoir', icon: faPencil, color: 'text-violet', label: 'Devoir', desc: 'Exercice ou projet à rendre (date limite requise).' },
  { value: 'examen', icon: faFileLines, color: 'text-amber-600', label: 'Examen', desc: 'Sujet ou informations sur un examen (date requise).' },
]

export default function ProfPublier() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const toast = useToast()
  const { data: modules, loading: ml } = useAsync(() => academics.modules(), [])

  const [form, setForm] = useState({
    titre: '', description: '', type: 'cours',
    module: params.get('module') || '',
    date_limite: '',
  })
  const [file, setFile]   = useState(null)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState(null)

  // Pré-sélectionner le module si passé en query param
  useEffect(() => {
    if (params.get('module') && modules?.length) {
      setForm((f) => ({ ...f, module: params.get('module') }))
    }
  }, [modules]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!file) { setError({ message: 'Veuillez sélectionner un fichier.' }); return }
    if (!form.module) { setError({ message: 'Veuillez choisir un module.' }); return }
    if (form.type !== 'cours' && !form.date_limite) { setError({ message: 'La date limite est requise pour les devoirs et examens.' }); return }
    setBusy(true); setError(null)
    try {
      await resources.create({ ...form, file })
      toast(`Ressource « ${form.titre} » publiée avec succès !`)
      navigate('/professeur/modules')
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  if (ml) return <Spinner />

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/professeur/modules"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ardoise hover:text-uta transition">
        <ArrowLeft className="size-4" /> Retour aux modules
      </Link>

      <PageHeader
        eyebrow="Espace enseignant"
        title="Publier une ressource"
        subtitle="Déposez un fichier et renseignez les informations ci-dessous."
      />

      <form onSubmit={submit} className="space-y-6">
        {/* Type de ressource */}
        <div className="card p-5">
          <p className="label mb-3">Type de ressource</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TYPES.map(({ value, label, desc, icon, color }) => (
              <label key={value}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3.5 transition
                  ${form.type === value
                    ? 'border-uta bg-uta-50'
                    : 'border-ligne bg-white hover:border-uta-200'}`}>
                <input type="radio" name="type" value={value} checked={form.type === value}
                  onChange={set('type')} className="sr-only" />
                <span className="font-semibold"><FontAwesomeIcon icon={icon} className={`mr-1.5 ${color}`} />{label}</span>
                <span className="text-xs text-ardoise">{desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Infos */}
        <div className="card p-5 space-y-4">
          <div>
            <label htmlFor="pub-titre" className="label">Titre</label>
            <input id="pub-titre" type="text" required maxLength={200} className="input"
              placeholder="Ex : Chapitre 3 — Les jointures SQL"
              value={form.titre} onChange={set('titre')} />
          </div>

          <div>
            <label htmlFor="pub-desc" className="label">Description <span className="font-normal text-ardoise">(optionnelle)</span></label>
            <textarea id="pub-desc" className="input" rows={3}
              placeholder="Brève description du contenu…"
              value={form.description} onChange={set('description')} />
          </div>

          <div className={`grid gap-4 ${form.type !== 'cours' ? 'sm:grid-cols-2' : ''}`}>
            <div>
              <label htmlFor="pub-module" className="label">Module</label>
              <select id="pub-module" className="input" required value={form.module} onChange={set('module')}>
                <option value="">— Choisir un module —</option>
                {(modules || []).map((m) => (
                  <option key={m.id} value={m.id}>{m.code} — {m.nom}</option>
                ))}
              </select>
            </div>
            {form.type !== 'cours' && (
              <div>
                <label htmlFor="pub-deadline" className="label">
                  {form.type === 'devoir' ? 'Date limite de rendu' : 'Date de l’examen'}
                </label>
                <input id="pub-deadline" type="datetime-local" required className="input"
                  min={new Date().toISOString().slice(0, 16)}
                  value={form.date_limite} onChange={set('date_limite')} />
              </div>
            )}
          </div>
        </div>

        {/* Fichier */}
        <div className="card p-5">
          <p className="label mb-3">Fichier <span className="font-normal text-ardoise">(max {MAX_UPLOAD_MB} Mo)</span></p>
          <FileDropzone file={file} onChange={setFile} maxMb={MAX_UPLOAD_MB} />
        </div>

        <ErrorBox error={error} />

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 !py-3" disabled={busy} id="publish-submit">
            <UploadCloud className="size-4" />
            {busy ? 'Publication en cours…' : 'Publier la ressource'}
          </button>
          <Link to="/professeur/modules" className="btn-ghost !py-3 px-6">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
