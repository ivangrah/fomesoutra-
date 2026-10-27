import { useState } from 'react'
import { Save, KeyRound, Download, History } from 'lucide-react'
import { Avatar, ErrorBox, PageHeader, useAsync } from '../components/ui'
import { auth, history, submissions } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate, formatDateTime, ROLE_LABELS } from '../lib/format'

export default function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ prenom: user.prenom, nom: user.nom })
  const [pwd, setPwd] = useState({ old: '', next: '' })
  const [error, setError] = useState(null)
  const downloads = useAsync(() => history.downloads(), [])
  const subs = useAsync(() => (user.role === 'etudiant' ? submissions.list() : Promise.resolve([])), [])

  const saveInfo = async (e) => {
    e.preventDefault()
    setUser(await auth.updateMe(form))
    toast('Profil mis à jour.')
  }
  const savePwd = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await auth.changePassword(pwd.old, pwd.next)
      setPwd({ old: '', next: '' })
      toast('Mot de passe modifié.')
    } catch (err) { setError(err) }
  }

  const activity = [
    ...(downloads.data || []).map((d) => ({ at: d.at, icon: Download, text: `Téléchargement — ${d.resource_detail.titre}` })),
    ...(subs.data || []).map((s) => ({ at: s.submitted_at, icon: History, text: `Rendu déposé — ${s.resource_detail?.titre}` })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at))

  return (
    <>
      <PageHeader eyebrow="Mon compte" title="Profil" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="card h-fit p-6 text-center">
          <Avatar user={user} size="size-20" className="mx-auto text-2xl" />
          <p className="mt-4 text-lg font-extrabold">{user.prenom} {user.nom}</p>
          <p className="text-sm text-ardoise">{user.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="badge bg-uta-50 text-uta">{ROLE_LABELS[user.role]}</span>
            {user.niveau && <span className="badge bg-violet-50 text-violet">Niveau {user.niveau}</span>}
          </div>
          <p className="mt-5 border-t border-ligne pt-4 text-xs text-ardoise">Membre depuis le {formatDate(user.date_joined)}</p>
        </aside>

        <div className="space-y-6">
          <form onSubmit={saveInfo} className="card p-6">
            <h2 className="font-bold">Informations personnelles</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="p-prenom" className="label">Prénom</label><input id="p-prenom" className="input" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
              <div><label htmlFor="p-nom" className="label">Nom</label><input id="p-nom" className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="sm:col-span-2"><label htmlFor="p-email" className="label">E-mail UTA</label><input id="p-email" className="input bg-casse" disabled value={user.email} /></div>
            </div>
            <button className="btn-primary mt-5" id="profile-save"><Save className="size-4" /> Enregistrer</button>
          </form>

          <form onSubmit={savePwd} className="card p-6">
            <h2 className="font-bold">Mot de passe</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="p-old" className="label">Mot de passe actuel</label><input id="p-old" type="password" autoComplete="current-password" required className="input" value={pwd.old} onChange={(e) => setPwd({ ...pwd, old: e.target.value })} /></div>
              <div><label htmlFor="p-new" className="label">Nouveau mot de passe</label><input id="p-new" type="password" autoComplete="new-password" minLength={8} required className="input" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} /></div>
            </div>
            <div className="mt-4"><ErrorBox error={error} /></div>
            <button className="btn-secondary mt-4" id="password-save"><KeyRound className="size-4" /> Modifier</button>
          </form>

          <section className="card p-6">
            <h2 className="font-bold">Historique d’activité</h2>
            {activity.length === 0 ? <p className="mt-3 text-sm text-ardoise">Aucune activité pour le moment.</p> : (
              <ol className="mt-4 space-y-1">
                {activity.slice(0, 10).map((a, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-casse">
                    <span className="grid size-8 place-items-center rounded-lg bg-uta-50 text-uta"><a.icon className="size-4" /></span>
                    <span className="min-w-0 flex-1 truncate text-sm">{a.text}</span>
                    <time className="shrink-0 text-xs text-ardoise">{formatDateTime(a.at)}</time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
