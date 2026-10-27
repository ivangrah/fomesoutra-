import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, GraduationCap, Presentation, ShieldCheck } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { ErrorBox } from '../components/ui'
import GoogleButton from '../components/GoogleButton'
import { homeFor, useAuth } from '../context/AuthContext'
import { EMAIL_DOMAIN } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand } from '@fortawesome/free-solid-svg-icons'

const DEMO = [
  { email: 'etudiant@uta.ci', label: 'Étudiant', icon: GraduationCap },
  { email: 'prof@uta.ci', label: 'Professeur', icon: Presentation },
  { email: 'admin@uta.ci', label: 'Admin', icon: ShieldCheck },
]

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e, creds) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const u = await login(creds?.email ?? email, creds?.password ?? password)
      navigate(location.state?.from || homeFor(u.role), { replace: true })
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  const googleSubmit = useCallback(async (payload) => {
    setBusy(true)
    setError(null)
    try {
      const u = await loginWithGoogle(payload)
      navigate(location.state?.from || homeFor(u.role), { replace: true })
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }, [loginWithGoogle, navigate, location.state])

  return (
    <AuthShell
      title={<>Bon retour <FontAwesomeIcon icon={faHand} className="text-amber-500" /></>}
      subtitle="Connectez-vous avec votre adresse e-mail UTA."
      footer={<>Pas encore de compte ? <Link to="/inscription" className="font-semibold text-uta hover:underline">Créer un compte</Link></>}
    >
      {location.state?.registered && (
        <div className="mb-5 rounded-xl border border-uta-200 bg-uta-50 px-4 py-3 text-sm text-profond">{location.state.registered}</div>
      )}
      <GoogleButton onAuth={googleSubmit} onError={setError} disabled={busy} />
      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ardoise/70">
        <span className="h-px flex-1 bg-ligne" /> ou avec votre e-mail <span className="h-px flex-1 bg-ligne" />
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="label">Adresse e-mail</label>
          <input id="login-email" type="email" required autoComplete="username" className="input" placeholder={`prenom.nom@${EMAIL_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="login-password" className="label">Mot de passe</label>
          <div className="relative">
            <input id="login-password" type={show ? 'text' : 'password'} required autoComplete="current-password" className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ardoise/60 hover:text-ardoise" aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <ErrorBox error={error} />
        <button type="submit" className="btn-primary w-full !py-3" disabled={busy} id="login-submit">
          <LogIn className="size-4" /> {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-8 rounded-2xl border border-dashed border-violet-100 bg-violet-50/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-violet">Comptes de démonstration</p>
        <p className="mt-1 text-xs text-ardoise">Mot de passe : <code className="rounded bg-white px-1 font-semibold">demo1234</code></p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO.map(({ email: em, label, icon: Icon }) => (
            <button key={em} type="button" disabled={busy} onClick={() => submit(null, { email: em, password: 'demo1234' })}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-ligne bg-white px-2 py-3 text-xs font-semibold transition hover:border-violet-300 hover:text-violet"
              id={`demo-${label.toLowerCase()}`}>
              <Icon className="size-5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}
