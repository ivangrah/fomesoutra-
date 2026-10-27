import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Modal, ErrorBox } from './ui'
import FileDropzone from './FileDropzone'
import { submissions, MAX_UPLOAD_MB } from '../services/api'
import { useToast } from '../context/ToastContext'
import { formatDateTime } from '../lib/format'

/** Modale de dépôt d'un rendu (étudiant) */
export default function SubmitModal({ resource, onClose, onDone }) {
  const toast = useToast()
  const [file, setFile] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await submissions.submit({ resource: resource.id, file, commentaire })
      toast('Votre rendu a bien été déposé.')
      onDone?.()
      setFile(null)
      setCommentaire('')
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!resource} onClose={onClose} title="Déposer mon rendu" id="submit-modal">
      {resource && (
        <form onSubmit={submit} className="space-y-5">
          <div className="rounded-2xl bg-violet-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-violet">{resource.module_detail?.code}</p>
            <p className="mt-0.5 font-bold">{resource.titre}</p>
            <p className="mt-1 text-sm text-ardoise">Date limite : <strong className="text-encre">{formatDateTime(resource.date_limite)}</strong></p>
          </div>
          {resource.my_submission && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Vous avez déjà déposé <strong>{resource.my_submission.fichier.name}</strong>. Un nouveau dépôt le remplacera.
            </p>
          )}
          <div>
            <span className="label">Fichier du rendu</span>
            <FileDropzone file={file} onChange={setFile} id="submission-file" />
          </div>
          <div>
            <label htmlFor="submission-comment" className="label">Commentaire <span className="font-normal text-ardoise">(facultatif)</span></label>
            <textarea id="submission-comment" rows={3} className="input resize-none" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Un mot pour le professeur…" />
          </div>
          <ErrorBox error={error} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" id="submission-send" disabled={!file || busy || file.size > MAX_UPLOAD_MB * 1048576}>
              <Upload className="size-4" /> {busy ? 'Envoi…' : 'Déposer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
