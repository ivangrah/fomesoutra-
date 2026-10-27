import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Inbox, UserRound, UploadCloud, Users, Layers, FolderOpen,
  LogOut, Sparkles, Menu, X, GraduationCap,
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import Logo from './Logo'
import { Avatar, Spinner } from './ui'
import { homeFor, useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../lib/format'

const NAV = {
  etudiant: [
    { to: '/etudiant', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/etudiant/modules', label: 'Mes modules', icon: BookOpen },
    { to: '/etudiant/rendus', label: 'Mes rendus', icon: Inbox },
    { to: '/etudiant/profil', label: 'Profil', icon: UserRound },
  ],
  professeur: [
    { to: '/professeur', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/professeur/modules', label: 'Mes modules', icon: BookOpen },
    { to: '/professeur/publier', label: 'Publier', icon: UploadCloud },
    { to: '/professeur/rendus', label: 'Rendus reçus', icon: Inbox },
    { to: '/professeur/profil', label: 'Profil', icon: UserRound },
  ],
  admin: [
    { to: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true },
    { to: '/admin/filieres', label: 'Filières', icon: GraduationCap },
    { to: '/admin/modules', label: 'Modules', icon: Layers },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/admin/ressources', label: 'Ressources', icon: FolderOpen },
    { to: '/admin/profil', label: 'Profil', icon: UserRound },
  ],
}

/** Garde de route : exige une session et le bon rôle */
export function RequireRole({ role }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return <AppLayout />
}

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawer, setDrawer] = useState(false)
  const items = NAV[user.role]
  const mobileItems = items.slice(0, 5)

  const doLogout = () => {
    logout()
    navigate('/')
  }

  const linkCls = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      isActive ? 'bg-white/15 text-white shadow-inner' : 'text-uta-100/80 hover:bg-white/10 hover:text-white'
    }`

  const Sidebar = (
    <div className="flex h-full flex-col bg-uta p-4 text-white">
      <Link to={homeFor(user.role)} className="mb-8 px-2 pt-2" onClick={() => setDrawer(false)}>
        <Logo variant="white" size="sm" withTagline />
      </Link>
      <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-uta-200/70">{ROLE_LABELS[user.role]}</p>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Navigation principale">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkCls} onClick={() => setDrawer(false)}>
            <Icon className="size-[18px]" /> {label}
          </NavLink>
        ))}
      </nav>

      {user.role === 'etudiant' && (
        <div className="mb-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <p className="flex items-center gap-1.5 text-sm font-bold"><Sparkles className="size-4 text-violet-300" /> Tutoriels</p>
          <p className="mt-1 text-xs text-uta-100/80">Bientôt : vidéos et fiches de l'équipe tutorat sur les notions difficiles.</p>
        </div>
      )}

      <Link to="/" onClick={() => setDrawer(false)} id="nav-site-home"
        className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-uta-100/80 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white">
        <FontAwesomeIcon icon={faHouse} className="w-[18px] text-violet-200" /> Retour à l’accueil
      </Link>

      <div className="flex items-center gap-3 rounded-2xl bg-black/10 p-2.5">
        <Avatar user={user} className="ring-2 ring-white/30" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{user.prenom} {user.nom}</p>
          <p className="truncate text-xs text-uta-100/70">{user.email}</p>
        </div>
        <button onClick={doLogout} className="rounded-lg p-2 text-uta-100/80 transition hover:bg-white/10 hover:text-white" aria-label="Se déconnecter" id="logout-btn">
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh lg:pl-72">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 lg:block">{Sidebar}</aside>

      {/* Drawer mobile (admin : plus de 5 entrées) */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-profond/40 backdrop-blur-sm" onClick={() => setDrawer(false)} aria-label="Fermer le menu" />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-up shadow-2xl">{Sidebar}</aside>
        </div>
      )}

      {/* Barre supérieure mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-ligne bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link to={homeFor(user.role)}><Logo size="sm" /></Link>
        <div className="flex items-center gap-1">
          <Link to="/" className="btn-ghost !p-2" aria-label="Retour à l’accueil" id="topbar-home">
            <FontAwesomeIcon icon={faHouse} className="size-5" />
          </Link>
          <Avatar user={user} size="size-8" />
          <button className="btn-ghost !p-2" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu" id="menu-btn">
            {drawer ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <Outlet />
      </main>

      {/* Navigation basse mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid border-t border-ligne bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }} aria-label="Navigation mobile">
        {mobileItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[0.65rem] font-semibold transition ${isActive ? 'text-uta' : 'text-ardoise/70'}`}>
            {({ isActive }) => (
              <>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${isActive ? 'bg-uta-50' : ''}`}><Icon className="size-5" /></span>
                <span className="truncate">{label.split(' ')[0] === 'Tableau' ? 'Tableau' : label.replace('Mes ', '')}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
