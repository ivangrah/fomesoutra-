import { useEffect, useRef, useState } from 'react'
import { Modal, Avatar } from './ui'
import { auth } from '../services/api'
import { ROLE_LABELS } from '../lib/format'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GIS_SRC = 'https://accounts.google.com/gsi/client'

/** Logo « G » officiel aux 4 couleurs Google */
export function GoogleLogo({ className = 'size-5' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.3-4 6.8-9.9 6.8-16.9z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

/**
 * Bouton « Continuer avec Google ».
 * - Si VITE_GOOGLE_CLIENT_ID est défini : bouton officiel Google Identity Services.
 * - Sinon (démo) : faux sélecteur de comptes limité aux comptes de la base locale.
 */
export default function GoogleButton({ onAuth, onError, disabled }) {
  const holder = useRef(null)
  const [picker, setPicker] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    const init = () => {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (r) => onAuth({ credential: r.credential }),
      })
      window.google.accounts.id.renderButton(holder.current, {
        theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'fr', width: holder.current.clientWidth,
      })
    }
    if (window.google?.accounts?.id) return init()
    let s = document.querySelector(`script[src="${GIS_SRC}"]`)
    if (!s) {
      s = Object.assign(document.createElement('script'), { src: GIS_SRC, async: true })
      document.head.appendChild(s)
    }
    s.addEventListener('load', init)
    s.addEventListener('error', () => onError?.(new Error('Impossible de charger Google. Vérifiez votre connexion.')))
    return () => s.removeEventListener('load', init)
  }, [onAuth, onError])

  if (CLIENT_ID) return <div ref={holder} className="flex min-h-11 w-full justify-center" id="google-signin" />

  const accounts = picker ? auth.googleDemoAccounts() : []
  return (
    <>
      <button type="button" disabled={disabled} onClick={() => setPicker(true)} id="google-signin"
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[var(--radius-btn)] border-[1.5px] border-ligne bg-white px-4 py-3 text-sm font-semibold text-encre shadow-sm transition hover:border-uta-200 hover:shadow-md disabled:pointer-events-none disabled:opacity-50">
        <GoogleLogo /> Continuer avec Google
      </button>

      <Modal open={picker} onClose={() => setPicker(false)} title="Choisir un compte Google" id="google-modal">
        <p className="mb-4 rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet">
          Mode démonstration : aucun vrai compte Google n’est utilisé. Ajoutez <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> dans <code className="font-semibold">.env</code> pour activer la vraie connexion.
        </p>
        <ul className="divide-y divide-ligne">
          {accounts.map((a) => (
            <li key={a.email}>
              <button type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-casse"
                onClick={() => { setPicker(false); onAuth({ email: a.email }) }}>
                <Avatar user={{ prenom: a.name.split(' ')[0], nom: a.name.split(' ').slice(-1)[0], role: a.role }} size="size-10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{a.name}</span>
                  <span className="block truncate text-xs text-ardoise">{a.email} · {ROLE_LABELS[a.role]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  )
}
