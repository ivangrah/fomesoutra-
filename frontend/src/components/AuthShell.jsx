import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import Logo, { LogoMark } from './Logo'

/** Mise en page écran partagé pour connexion / inscription */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-uta p-12 text-white lg:flex lg:flex-col">
        <LogoMark variant="white" size={520} className="pointer-events-none absolute -bottom-24 -right-28 opacity-[0.07]" />
        <Link to="/"><Logo variant="white" withTagline /></Link>
        <div className="relative mt-auto max-w-md">
          <p className="text-3xl font-extrabold leading-tight tracking-tight">
            Un accès permanent et structuré aux ressources de vos modules.
          </p>
          <ul className="mt-8 space-y-3 text-uta-100">
            {['Cours, devoirs et examens centralisés', 'Échéances claires avec compte à rebours', 'Rendus déposés en quelques clics'].map((t) => (
              <li key={t} className="flex items-center gap-2.5"><CheckCircle2 className="size-5 text-clair" /> {t}</li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-sm text-uta-200/70">Université de Technologie d’Abidjan · Réservé à la communauté UTA</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden"><Logo size="sm" /></Link>
          <Link to="/" id="back-home"
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-ligne bg-white px-3.5 py-1.5 text-sm font-semibold text-ardoise shadow-sm transition hover:border-uta-200 hover:text-uta">
            <FontAwesomeIcon icon={faArrowLeft} className="text-clair" /> Retour à l’accueil
          </Link>
        </div>
        <div className="m-auto w-full max-w-md animate-fade-up py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-ardoise">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-ardoise">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
