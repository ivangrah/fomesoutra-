import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { ErrorBox } from '../components/ui'
import { auth as authApi, academics } from '../services/api'
import { useAuth, homeFor } from '../context/AuthContext'
import { useAsync } from '../components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap, faChalkboardUser, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

const NIVS = ['L1', 'L2', 'L3']

export default function Register() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const { data: filieres } = useAsync(() => academics.filieres({ activeOnly: true }), [])

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', password: '', confirm: '',
    role: 'etudiant', filiere: '1', niveau: 'L2',
  })
  const [show, setShow]   = useState(false)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError({ message: 'Les mots de passe ne correspondent pas.' }); return }
    if (form.password.length < 8)       { setError({ message: 'Le mot de passe doit comporter au moins 8 caractères.' }); return }
    setBusy(true); setError(null)
    try {
      const user = await authApi.register(form)
      if (user.role === 'etudiant') {
        // Connexion directe si étudiant (auto-approuvé)
        const u = await login(form.email, form.password)
        navigate(homeFor(u.role), { replace: true })
      } else {
        navigate('/connexion', { state: { registered: 'Votre compte professeur a été créé. Attendez la validation de l’administration.' } })
      }
    } catch (err) {
      setError(err)
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Rejoignez la plateforme SavoirPlus avec votre adresse UTA."
      footer={<>Déjà un compte ? <Link to="/connexion" className="font-semibold text-uta hover:underline">Se connecter</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Rôle */}
        <div>
          <p className="label">Je suis…</p>
          <div className="grid grid-cols-2 gap-2">
            {[['etudiant', faGraduationCap, 'Étudiant'], ['professeur', faChalkboardUser, 'Enseignant']].map(([val, ico, lbl]) => (
              <label key={val}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition
                  ${form.role === val ? 'border-uta bg-uta-50 text-uta' : 'border-ligne bg-white text-ardoise hover:border-uta-200'}`}>
                <input type="radio" name="role" value={val} checked={form.role === val} onChange={set('role')} className="sr-only" />
                <FontAwesomeIcon icon={ico} className={form.role === val ? 'text-violet' : 'text-clair'} />
                {lbl}
              </label>
            ))}
          </div>
        </div>

        {/* Noms */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-prenom" className="label">Prénom</label>
            <input id="reg-prenom" type="text" required autoComplete="given-name" className="input" placeholder="Koné" value={form.prenom} onChange={set('prenom')} />
          </div>
          <div>
            <label htmlFor="reg-nom" className="label">Nom</label>
            <input id="reg-nom" type="text" required autoComplete="family-name" className="input" placeholder="Mariam" value={form.nom} onChange={set('nom')} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="label">Adresse e-mail UTA</label>
          <input id="reg-email" type="email" required autoComplete="username" className="input" placeholder="prenom.nom@uta.ci" value={form.email} onChange={set('email')} />
        </div>

        {/* Filière + niveau (étudiant) */}
        <div className={`grid gap-3 ${form.role === 'etudiant' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label htmlFor="reg-filiere" className="label">Filière</label>
            <select id="reg-filiere" className="input" value={form.filiere} onChange={set('filiere')}>
              {(filieres || []).map((f) => (
                <option key={f.id} value={f.id}>{f.code} — {f.nom}</option>
              ))}
            </select>
          </div>
          {form.role === 'etudiant' && (
            <div>
              <label htmlFor="reg-niveau" className="label">Niveau</label>
              <select id="reg-niveau" className="input" value={form.niveau} onChange={set('niveau')}>
                {NIVS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="reg-password" className="label">Mot de passe</label>
          <div className="relative">
            <input id="reg-password" type={show ? 'text' : 'password'} required autoComplete="new-password" className="input pr-11" value={form.password} onChange={set('password')} />
            <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ardoise/60 hover:text-ardoise" aria-label="Afficher / masquer">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="reg-confirm" className="label">Confirmer le mot de passe</label>
          <input id="reg-confirm" type="password" required autoComplete="new-password" className="input" value={form.confirm} onChange={set('confirm')} />
        </div>

        <ErrorBox error={error} />

        {form.role === 'professeur' && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5 text-amber-500" />Les comptes enseignants doivent être validés par l'administration avant de pouvoir se connecter.
          </p>
        )}

        <button type="submit" className="btn-primary w-full !py-3" disabled={busy} id="register-submit">
          <UserPlus className="size-4" /> {busy ? 'Création en cours…' : 'Créer mon compte'}
        </button>
      </form>
    </AuthShell>
  )
}
