import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { FileIcon } from './ui'
import { formatSize } from '../lib/format'
import { MAX_UPLOAD_MB } from '../services/api'

/** Zone de dépôt : glisser-déposer ou clic — tout type de fichier accepté */
export default function FileDropzone({ file, onChange, id = 'file-input', hint }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const tooBig = file && file.size > MAX_UPLOAD_MB * 1024 * 1024

  const pick = (f) => f && onChange(f)

  if (file) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border p-3 ${tooBig ? 'border-red-300 bg-red-50' : 'border-uta-200 bg-uta-50/60'}`}>
        <FileIcon name={file.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{file.name}</p>
          <p className={`text-xs ${tooBig ? 'font-semibold text-red-700' : 'text-ardoise'}`}>
            {formatSize(file.size)} {tooBig && `— dépasse la limite de ${MAX_UPLOAD_MB} Mo`}
          </p>
        </div>
        <button type="button" onClick={() => onChange(null)} className="btn-ghost !p-2" aria-label="Retirer le fichier">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]) }}
      className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition ${
        over ? 'scale-[1.01] border-clair bg-uta-50' : 'border-ligne bg-casse/60 hover:border-uta-200 hover:bg-uta-50/50'
      }`}
    >
      <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-white text-uta shadow-sm transition group-hover:-translate-y-0.5">
        <UploadCloud className="size-6" />
      </span>
      <span className="text-sm font-semibold">
        <span className="text-uta underline decoration-uta-200 underline-offset-4">Choisissez un fichier</span> ou glissez-le ici
      </span>
      <span className="mt-1 text-xs text-ardoise">{hint || `PDF, Word, PowerPoint, vidéo, image, archive… — max ${MAX_UPLOAD_MB} Mo`}</span>
      <input ref={input} id={id} type="file" className="sr-only" onChange={(e) => pick(e.target.files[0])} />
    </label>
  )
}
