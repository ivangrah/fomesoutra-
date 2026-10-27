import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faRightToBracket, faUserPlus, faGraduationCap, faChalkboardUser, faShieldHalved,
  faBuildingColumns, faUserGraduate, faEnvelope, faHeart, faArrowUp,
} from '@fortawesome/free-solid-svg-icons'
import Logo, { LogoMark } from './Logo'

const YEAR = new Date().getFullYear()
const WORDMARK = 'SavoirPlus'
/* « + » flottants : animés par la page d'accueil (classe .float-plus) */
const PLUS = [
  { left: 8, top: 18, size: 22, speed: 0.6 }, { left: 46, top: 10, size: 16, speed: -0.8 },
  { left: 70, top: 40, size: 28, speed: 0.4 }, { left: 30, top: 62, size: 18, speed: -0.5 },
  { left: 88, top: 14, size: 20, speed: 0.9 },
]

/** Pied de page de la page d'accueil, animé à son apparition */
export default function LandingFooter({ onTop = () => window.scrollTo({ top: 0, behavior: 'smooth' }) }) {
  const root = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
      tl.from('.ft-bar', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'power2.inOut' })
        .from('.ft-brand > *', { y: 30, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .from('.ft-col', { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, clearProps: 'transform,translate,opacity' }, '<0.1')
        .from('.ft-underline', { width: 0, duration: 0.6, stagger: 0.12 }, '<0.3')
        .from('.ft-col li', { x: -24, opacity: 0, duration: 0.4, stagger: 0.05, clearProps: 'transform,translate,opacity' }, '<0.1')
        .from('.ft-word', { yPercent: 110, duration: 0.8, stagger: 0.04, ease: 'back.out(1.6)' }, '-=0.4')
        .from('.ft-bottom > *', { y: 16, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.5')

      // Filigrane du logo : lente rotation + parallaxe au scroll
      gsap.to('.ft-mark', { rotate: 8, y: -40, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true } })
      // Cœur qui bat et flèche qui invite à remonter
      gsap.to('.ft-heart', { scale: 1.35, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: -1, repeatDelay: 0.9 })
      gsap.to('.ft-arrow', { y: -4, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      // Grand logotype : chaque lettre réagit au survol
      gsap.utils.toArray('.ft-word').forEach((c) => {
        c.addEventListener('mouseenter', () => gsap.fromTo(c, { y: 0 }, { y: -18, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }))
      })
    })
    return () => mm.revert()
  }, { scope: root })

  return (
    <footer ref={root} className="relative overflow-hidden bg-profond text-uta-100">
      <div className="ft-bar h-1.5 bg-violet" />
      <span className="ft-mark pointer-events-none absolute -bottom-24 -right-16 block">
        <LogoMark variant="white" size={420} className="opacity-[0.06]" />
      </span>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {PLUS.map((p, i) => (
          <span key={i} className="float-plus absolute font-extrabold leading-none text-white" data-speed={p.speed}
            style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: p.size, opacity: 0.12 }}>+</span>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="ft-brand">
          <Logo variant="white" withTagline />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-uta-100/80">
            Cours, devoirs, examens et tutoriels des étudiants de l’UTA, centralisés au même endroit pour réussir votre année.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-clair" /> Phase pilote
          </span>
        </div>

        <FooterCol title="Plateforme">
          <FooterLink to="/" icon={faHouse}>Accueil</FooterLink>
          <FooterLink to="/connexion" icon={faRightToBracket}>Connexion</FooterLink>
          <FooterLink to="/inscription" icon={faUserPlus}>Créer un compte</FooterLink>
        </FooterCol>

        <FooterCol title="Espaces">
          <FooterLink to="/connexion" icon={faGraduationCap}>Étudiants</FooterLink>
          <FooterLink to="/connexion" icon={faChalkboardUser}>Professeurs</FooterLink>
          <FooterLink to="/connexion" icon={faShieldHalved}>Administration</FooterLink>
        </FooterCol>

        <FooterCol title="Université">
          <li className="flex items-start gap-3 text-sm text-uta-100/80">
            <FontAwesomeIcon icon={faBuildingColumns} className="mt-0.5 w-4 text-clair" />
            Université de Technologie d’Abidjan (UTA)
          </li>
          <li className="flex items-start gap-3 text-sm text-uta-100/80">
            <FontAwesomeIcon icon={faUserGraduate} className="mt-0.5 w-4 text-violet-200" />
            Toutes les filières de l’UTA
          </li>
          <li className="flex items-start gap-3 text-sm text-uta-100/80">
            <FontAwesomeIcon icon={faEnvelope} className="mt-0.5 w-4 text-clair" />
            Réservé aux adresses @uta.ci
          </li>
        </FooterCol>
      </div>

      {/* Grand logotype en filigrane, révélé lettre par lettre */}
      <div className="relative mx-auto max-w-6xl select-none overflow-hidden px-5" aria-hidden="true">
        <p className="flex justify-between text-[17vw] font-extrabold leading-[0.85] tracking-tight text-white/[0.07] lg:text-[11.5rem]">
          {[...WORDMARK].map((c, i) => <span key={i} className="ft-word inline-block cursor-default transition-colors hover:text-white/20">{c}</span>)}
        </p>
      </div>

      <div className="relative border-t border-white/10">
        <div className="ft-bottom mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-uta-100/70 sm:flex-row">
          <p>© {YEAR} SavoirPlus · Université de Technologie d’Abidjan</p>
          <p className="flex items-center gap-1.5">
            Conçu avec <FontAwesomeIcon icon={faHeart} className="ft-heart text-violet-200" /> pour les étudiants de l’UTA
          </p>
          <a href="#top" onClick={(e) => { e.preventDefault(); onTop() }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-white/20">
            Haut de page <FontAwesomeIcon icon={faArrowUp} className="ft-arrow" />
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }) {
  return (
    <div className="ft-col">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white">{title}</h3>
      <span className="ft-underline mt-2 block h-0.5 w-8 rounded-full bg-clair" />
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ to, icon, children }) {
  return (
    <li>
      <Link to={to} className="group inline-flex items-center gap-3 text-sm text-uta-100/80 transition-colors hover:text-white">
        <FontAwesomeIcon icon={icon} className="w-4 text-clair transition-[color,rotate] duration-300 group-hover:rotate-12 group-hover:text-white" />
        <span className="relative">
          {children}
          <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
        </span>
      </Link>
    </li>
  )
}
