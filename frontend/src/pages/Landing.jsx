import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass, faArrowRight, faArrowUp, faBell, faCommentDots, faLayerGroup, faFolderOpen,
  faBookOpen, faCalendarCheck, faCloudArrowUp, faMobileScreen, faShieldHalved, faWandMagicSparkles,
  faGraduationCap, faChalkboardUser, faUserShield, faCircleCheck, faPencil, faHand, faFileLines, faFilm,
} from '@fortawesome/free-solid-svg-icons'
import Logo, { LogoMark } from '../components/Logo'
import LandingFooter from '../components/LandingFooter'
import { homeFor, useAuth } from '../context/AuthContext'
import * as seed from '../data/mock'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const VERT = '#1E7B34'
const VIOLET = '#5B2A86'

/* Données de vitrine tirées du jeu de démonstration (UTA) */
const MODULES = seed.modules.filter((m) => m.is_active).map((m, i) => {
  const prof = seed.users.find((u) => u.id === m.professeurs[0])
  return {
    ...m,
    fond: i % 2 ? VIOLET : VERT,
    prof: prof ? `${prof.prenom} ${prof.nom}` : 'À attribuer',
    initiales: prof ? `${prof.prenom[0]}${prof.nom[0]}` : '—',
    ressources: seed.resources.filter((r) => r.module === m.id).length,
  }
})
const STATS = [
  { value: MODULES.length, label: 'Modules en ligne' },
  { value: seed.resources.length, label: 'Ressources publiées' },
  { value: 3, label: 'Espaces dédiés' },
]
const ROTATING = ['cours', 'devoirs', 'examens', 'rendus']
const MARQUEE = ['Cours', 'Devoirs', 'Examens', 'Rendus', 'Tutoriels', 'Échéances', 'Modules', 'Ressources']

const FEATURES = [
  { icon: faBookOpen, title: 'Tout au même endroit', text: 'Chaque support de cours est rangé dans son module : fini les clés USB et les groupes WhatsApp.' },
  { icon: faCalendarCheck, title: 'Échéances visibles', text: 'Devoirs et examens affichés avec leur date limite et un compte à rebours.' },
  { icon: faCloudArrowUp, title: 'Rendus en un clic', text: 'Déposez vos travaux depuis votre téléphone et gardez l’historique de vos dépôts.' },
  { icon: faMobileScreen, title: 'Pensé pour le mobile', text: 'Une interface légère qui reste confortable sur smartphone comme sur ordinateur.' },
  { icon: faShieldHalved, title: 'Accès sécurisé', text: 'Réservé aux adresses @uta.ci : chacun ne voit que les modules de sa filière et de son niveau.' },
  { icon: faWandMagicSparkles, title: 'Tutoriels à venir', text: 'L’équipe tutorat préparera des fiches et vidéos sur les notions difficiles.' },
]

const PROFILS = [
  { icon: faGraduationCap, who: 'Étudiants', color: 'bg-uta', points: ['Ressources filtrées par module', 'Devoirs & examens à venir', 'Dépôt et suivi des rendus'] },
  { icon: faChalkboardUser, who: 'Professeurs', color: 'bg-violet', points: ['Publication en quelques clics', 'Tout format accepté', 'Consultation des rendus'] },
  { icon: faUserShield, who: 'Administration', color: 'bg-uta', points: ['Gestion filières & modules', 'Validation des comptes', 'Vue d’ensemble de l’activité'] },
]

/* Positions fixes (pseudo-aléatoires) des « + » flottants */
const PLUS_SPOTS = Array.from({ length: 14 }, (_, i) => {
  const r = (n) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1
  return { left: 4 + r(1) * 92, top: 6 + r(2) * 88, size: 16 + r(3) * 34, speed: (r(4) - 0.5) * 2, rot: r(5) * 90 }
})

/** Signes « + » de la marque qui flottent en arrière-plan (parallaxe au scroll) */
function FloatingPlus({ count = 10, colors = [VERT, VIOLET], opacity = 0.35 }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PLUS_SPOTS.slice(0, count).map((p, i) => (
        <span key={i} className="float-plus absolute font-extrabold leading-none" data-speed={p.speed}
          style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: p.size, color: colors[i % colors.length], opacity, rotate: `${p.rot}deg` }}>
          +
        </span>
      ))}
    </div>
  )
}

/** Mot entouré d'un trait dessiné à la main (animé par GSAP) */
function Circled({ children, color = VIOLET }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-2">
      <span className="relative z-10">{children}</span>
      <svg className="pointer-events-none absolute -inset-x-2 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1rem)]" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
        <path className="circle-draw" pathLength="1" d="M168 8C246 6 296 20 294 42c-3 24-84 34-154 32C60 72 6 60 8 38 10 18 80 6 186 10" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/** Découpe un texte en lettres animables, sans couper les mots */
function Chars({ text }) {
  return text.split(' ').map((word, w, all) => (
    <span key={w} className="inline-block whitespace-nowrap">
      {[...word].map((c, i) => <span key={i} className="char inline-block">{c}</span>)}
      {w < all.length - 1 && <span className="inline-block">&nbsp;</span>}
    </span>
  ))
}

/** Pluie de « + » aux couleurs de la marque, depuis un point de l'écran */
function burstPlus(x, y, count = 18) {
  const colors = [VERT, VIOLET, '#3FAE5A']
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    el.textContent = '+'
    Object.assign(el.style, {
      position: 'fixed', left: `${x}px`, top: `${y}px`, zIndex: 60, pointerEvents: 'none',
      fontWeight: 800, fontSize: `${gsap.utils.random(16, 34)}px`, color: colors[i % colors.length], lineHeight: 1,
    })
    document.body.appendChild(el)
    const angle = gsap.utils.random(0, Math.PI * 2)
    const dist = gsap.utils.random(60, 180)
    gsap.fromTo(el, { xPercent: -50, yPercent: -50, scale: 0, rotate: 0 }, {
      x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 40, scale: 1, rotate: gsap.utils.random(-180, 180),
      duration: gsap.utils.random(0.7, 1.1), ease: 'power3.out',
      onComplete: () => gsap.to(el, { opacity: 0, y: '+=40', duration: 0.4, onComplete: () => el.remove() }),
    })
  }
}

export default function Landing() {
  const { user } = useAuth()
  const cta = user ? homeFor(user.role) : '/inscription'
  const root = useRef(null)
  const [query, setQuery] = useState('')
  const lenis = useRef(null)
  const [gridRef] = useAutoAnimate({ duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' })

  /* Scroll fluide (Lenis) synchronisé avec GSAP ScrollTrigger, limité à la page d'accueil */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const l = new Lenis({ anchors: { offset: -80 }, lerp: 0.09 })
    lenis.current = l
    l.on('scroll', ScrollTrigger.update)
    const tick = (time) => l.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      l.destroy()
      lenis.current = null
    }
  }, [])

  const scrollToTarget = (target) => {
    if (lenis.current) lenis.current.scrollTo(target, { offset: target === 0 ? 0 : -80 })
    else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' })
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }

  const modules = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? MODULES.filter((m) => `${m.code} ${m.nom} ${m.prof}`.toLowerCase().includes(q)) : MODULES
  }, [query])

  const search = (e) => {
    e.preventDefault()
    scrollToTarget('#modules')
  }

  const plusClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    burstPlus(r.left + r.width / 2, r.top + r.height / 2)
  }

  useGSAP((_, contextSafe) => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* --- Barre de progression de lecture --- */
      gsap.to('.lp-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })

      /* --- En-tête qui se cache en descendant et revient en remontant --- */
      const header = gsap.to('.lp-header', { yPercent: -100, duration: 0.3, paused: true, ease: 'power2.out' })
      ScrollTrigger.create({
        start: 120, end: 'max',
        onUpdate: (self) => (self.direction === 1 ? header.play() : header.reverse()),
        onLeaveBack: () => header.reverse(),
      })

      /* --- Entrée du hero : lettres en 3D, cercle dessiné, puis visuel --- */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero .char', { yPercent: 120, rotateX: -90, opacity: 0, transformOrigin: '50% 100%', duration: 0.7, stagger: 0.025 })
        .from('.hero-circled', { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.4')
        .fromTo('.hero .circle-draw', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.3')
        .from('.hero-plus', { scale: 0, rotate: -180, duration: 0.7, ease: 'back.out(3)' }, '-=0.6')
        .from('.hero-fade', { y: 24, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
        .from('.hero-frame', { y: 80, rotate: -12, opacity: 0, duration: 1, ease: 'back.out(1.3)' }, 0.3)
        .from('.hero-ring', { scale: 0, opacity: 0, duration: 0.9, ease: 'back.out(1.7)' }, 0.6)
        .from('.hero-row', { x: 40, opacity: 0, duration: 0.5, stagger: 0.12 }, 0.9)
        .from('.hero-bubble', { scale: 0, opacity: 0, duration: 0.5, stagger: 0.15, ease: 'back.out(2.5)' }, 1.2)
        .add(() => {
          const p = document.querySelector('.hero-plus')
          if (p) { const r = p.getBoundingClientRect(); burstPlus(r.left + r.width / 2, r.top + r.height / 2, 14) }
        })

      /* --- Mot qui défile : cours → devoirs → examens → rendus --- */
      const step = 100 / (ROTATING.length + 1)
      const rot = gsap.timeline({ repeat: -1, delay: 2.5 })
      for (let i = 1; i <= ROTATING.length; i++) {
        rot.to('.rot-track', { yPercent: -step * i, duration: 0.6, ease: 'back.inOut(1.6)' }, '+=1.4')
      }
      rot.set('.rot-track', { yPercent: 0 })

      /* --- « + » flottants : rotation lente, balancement et parallaxe au scroll --- */
      gsap.from('.hero .float-plus', { scale: 0, opacity: 0, duration: 0.8, stagger: 0.06, delay: 0.8, ease: 'back.out(2)' })
      gsap.utils.toArray('.float-plus').forEach((el) => {
        const speed = Number(el.dataset.speed)
        gsap.to(el, { rotation: speed > 0 ? 360 : -360, duration: gsap.utils.random(14, 26), ease: 'none', repeat: -1 })
        gsap.to(el, { x: 'random(-24, 24)', duration: 'random(3, 6)', ease: 'sine.inOut', yoyo: true, repeat: -1, repeatRefresh: true })
        gsap.to(el, {
          y: speed * -160, ease: 'none',
          scrollTrigger: { trigger: el.closest('section') || el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      /* --- Mouvements continus --- */
      gsap.to('.hero-bubble', { y: -12, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4, delay: 2 })
      gsap.to('.hero-ring', { rotate: 360, duration: 30, ease: 'none', repeat: -1 })
      gsap.utils.toArray('.dot').forEach((d, i) => {
        gsap.to(d, { x: 'random(-40, 40)', y: 'random(-30, 30)', duration: 'random(3, 5)', ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3, repeatRefresh: true })
      })
      gsap.to('.hero-row-live', { boxShadow: '0 0 0 4px rgb(91 42 134 / 0.18)', duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.5 })

      /* --- Bandeau défilant : accélère avec le scroll et change de sens en remontant --- */
      const marquee = gsap.to('.marquee-track', { xPercent: -50, ease: 'none', duration: 28, repeat: -1 })
      ScrollTrigger.create({
        onUpdate: (self) => {
          const dir = self.direction
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5)
          gsap.to(marquee, {
            timeScale: dir * boost, duration: 0.2, overwrite: true,
            onComplete: () => gsap.to(marquee, { timeScale: dir, duration: 1.2 }),
          })
        },
      })
      gsap.to('.marquee-plus', { rotate: 360, duration: 6, ease: 'none', repeat: -1 })

      /* --- Bandeau violet : ouverture en rideau, compteurs, pictos en parallaxe --- */
      gsap.from('.banner', {
        clipPath: 'inset(0% 50% 0% 50% round 1.75rem)', duration: 1.1, ease: 'power3.inOut',
        scrollTrigger: { trigger: '.banner', start: 'top 85%', once: true },
      })
      gsap.utils.toArray('.counter').forEach((el) => {
        const obj = { v: 0 }
        gsap.to(obj, {
          v: Number(el.dataset.value), duration: 1.8, delay: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(2, '0') },
        })
      })
      gsap.to('.banner-deco', {
        y: -50, rotate: 25, ease: 'none',
        scrollTrigger: { trigger: '.banner', start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      /* --- Titres de section : lettres qui montent + cercle dessiné --- */
      gsap.utils.toArray('.section-title').forEach((t) => {
        const st = { trigger: t, start: 'top 85%', once: true }
        gsap.from(t.querySelectorAll('.char'), { yPercent: 110, opacity: 0, duration: 0.5, stagger: 0.02, ease: 'power3.out', scrollTrigger: st })
        gsap.fromTo(t.querySelectorAll('.circle-draw'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, delay: 0.4, ease: 'power2.inOut', scrollTrigger: st })
        gsap.from(t.querySelectorAll('p'), { y: 20, opacity: 0, duration: 0.6, delay: 0.3, scrollTrigger: st })
      })

      /* --- Cartes modules : retournement 3D en cascade --- */
      ScrollTrigger.batch('.mod-card', {
        start: 'top 92%', once: true,
        onEnter: (els) => gsap.from(els, { rotateY: -35, y: 80, opacity: 0, transformPerspective: 900, transformOrigin: '0% 50%', duration: 0.9, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,translate,rotate,scale,opacity' }),
      })

      /* --- Avantages : arrivée en alternance gauche / droite + icône qui rebondit --- */
      gsap.utils.toArray('.feat-card').forEach((c, i) => {
        const st = { trigger: c, start: 'top 92%', once: true }
        gsap.from(c, { x: i % 2 ? 80 : -80, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: st, clearProps: 'transform,translate,rotate,scale,opacity' })
        gsap.from(c.querySelector('.feat-icon'), { scale: 0, rotate: -120, duration: 0.9, delay: 0.3, ease: 'elastic.out(1, 0.5)', scrollTrigger: st, clearProps: 'transform,translate,rotate,scale' })
      })

      /* --- Profils : avatars élastiques --- */
      ScrollTrigger.batch('.prof-card', {
        start: 'top 90%', once: true,
        onEnter: (els) => {
          gsap.from(els, { y: 60, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', clearProps: 'transform,translate,rotate,scale,opacity' })
          gsap.from(els.map((e) => e.querySelector('.prof-avatar')), { scale: 0, duration: 1.2, stagger: 0.15, delay: 0.2, ease: 'elastic.out(1, 0.4)', clearProps: 'transform,translate,rotate,scale' })
          gsap.from(els.flatMap((e) => [...e.querySelectorAll('li')]), { x: -20, opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.5 })
        },
      })
    })

    /* --- Interactions souris (ordinateur uniquement) --- */
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      // Curseur personnalisé : point violet + anneau vert
      const dot = root.current.querySelector('.cursor-dot')
      const ring = root.current.querySelector('.cursor-ring')
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 })
      const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 })
      const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' })
      let shown = false
      const move = (e) => {
        if (!shown) { shown = true; gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); gsap.to([dot, ring], { opacity: 1, duration: 0.3 }) }
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
      }
      const over = contextSafe((e) => gsap.to(ring, { scale: e.target.closest?.('a, button, input') ? 1.8 : 1, duration: 0.3 }))
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseover', over)

      // Boutons magnétiques
      const offs = gsap.utils.toArray('.magnetic').map((btn) => {
        const x = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' }), y = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' })
        const m = (e) => {
          const r = btn.getBoundingClientRect()
          x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35)
        }
        const l = contextSafe(() => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }))
        btn.addEventListener('mousemove', m); btn.addEventListener('mouseleave', l)
        return () => { btn.removeEventListener('mousemove', m); btn.removeEventListener('mouseleave', l) }
      })

      // Inclinaison 3D du visuel du hero
      const zone = root.current.querySelector('.hero-visual')
      const frame = root.current.querySelector('.hero-frame')
      gsap.set(frame, { transformPerspective: 1000 })
      const tx = gsap.quickTo(frame, 'rotateY', { duration: 0.6, ease: 'power3' }), ty = gsap.quickTo(frame, 'rotateX', { duration: 0.6, ease: 'power3' })
      const tilt = (e) => {
        const r = zone.getBoundingClientRect()
        tx(((e.clientX - r.left) / r.width - 0.5) * 16); ty(-((e.clientY - r.top) / r.height - 0.5) * 16)
      }
      const reset = () => { tx(0); ty(0) }
      zone.addEventListener('mousemove', tilt); zone.addEventListener('mouseleave', reset)

      // Cartes modules : le logo en filigrane suit la souris
      offs.push(...gsap.utils.toArray('.mod-card').map((card) => {
        const mark = card.querySelector('.mod-mark')
        const mx = gsap.quickTo(mark, 'x', { duration: 0.5 }), my = gsap.quickTo(mark, 'y', { duration: 0.5 })
        const mv = (e) => { const r = card.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.12); my((e.clientY - r.top - r.height / 2) * 0.12) }
        const lv = () => { mx(0); my(0) }
        card.addEventListener('mousemove', mv); card.addEventListener('mouseleave', lv)
        return () => { card.removeEventListener('mousemove', mv); card.removeEventListener('mouseleave', lv) }
      }))

      return () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseover', over)
        zone.removeEventListener('mousemove', tilt); zone.removeEventListener('mouseleave', reset)
        offs.forEach((off) => off())
      }
    })

    return () => mm.revert()
  }, { scope: root })

  return (
    <div ref={root} className="overflow-x-clip bg-white">
      {/* Curseur personnalisé (affiché seulement avec une souris) */}
      <span className="cursor-dot pointer-events-none fixed left-0 top-0 z-[70] size-2 rounded-full bg-violet opacity-0" aria-hidden="true" />
      <span className="cursor-ring pointer-events-none fixed left-0 top-0 z-[70] size-9 rounded-full border-2 border-uta opacity-0" aria-hidden="true" />

      {/* ===== Navigation ===== */}
      <header className="lp-header sticky top-0 z-40 border-b border-ligne/70 bg-white/90 backdrop-blur-md">
        <div className="lp-progress absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-violet" />
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
          <Link to="/" aria-label="SavoirPlus — accueil" className="shrink-0"><Logo size="sm" /></Link>
          <form onSubmit={search} className="relative mx-auto hidden w-full max-w-sm md:block" role="search">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un module…" aria-label="Rechercher un module"
              className="w-full rounded-full border border-ligne bg-casse py-2 pl-4 pr-10 text-sm outline-none transition focus:border-uta focus:bg-white" />
            <button type="submit" className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center text-uta" aria-label="Lancer la recherche">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>
          <nav className="ml-auto flex items-center gap-1 text-sm font-semibold text-encre md:ml-0">
            <a href="#modules" className="hidden rounded-lg px-3 py-2 transition hover:text-uta lg:block">Modules</a>
            <a href="#avantages" className="hidden rounded-lg px-3 py-2 transition hover:text-uta lg:block">Avantages</a>
            <a href="#profils" className="hidden rounded-lg px-3 py-2 transition hover:text-uta lg:block">Profils</a>
            {user ? (
              <Link to={homeFor(user.role)} className="btn-primary ml-2 whitespace-nowrap" id="nav-dashboard">Mon espace <FontAwesomeIcon icon={faArrowRight} /></Link>
            ) : (
              <>
                <Link to="/connexion" className="whitespace-nowrap rounded-lg px-2 py-2 transition hover:text-uta sm:px-3" id="nav-login">Se connecter</Link>
                <Link to="/inscription" className="btn-primary ml-1 whitespace-nowrap" id="nav-register">S’inscrire</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* ===== Hero (fond blanc uni) ===== */}
        <section className="hero relative overflow-hidden">
          <FloatingPlus count={12} colors={[VERT, VIOLET, '#3FAE5A']} />
          <span className="dot pointer-events-none absolute right-1/2 top-10 size-4 rounded-full bg-clair" />
          <span className="dot pointer-events-none absolute bottom-20 left-[45%] size-3 rounded-full bg-violet" />
          <span className="dot pointer-events-none absolute right-10 top-24 size-2.5 rounded-full bg-uta" />
          <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-2 lg:pb-28 lg:pt-20">
            <div>
              <span className="hero-fade inline-flex items-center gap-2 rounded-full bg-uta-50 px-3 py-1 text-xs font-bold text-uta">
                <span className="size-1.5 animate-pulse rounded-full bg-clair" /> Phase pilote · Étudiants de l’UTA
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-encre [perspective:600px] sm:text-5xl lg:text-[3.4rem]">
                <span className="block"><Chars text="Le savoir de vos cours," /></span>
                <span className="block">
                  <Chars text="toujours" />{' '}
                  <span className="hero-circled inline-block"><Circled><span className="text-uta">à portée</span></Circled></span>
                  <button type="button" onClick={plusClick} className="hero-plus inline-block cursor-pointer text-violet transition-colors hover:text-clair" aria-label="Petite surprise" title="Cliquez-moi !">+</button>
                </span>
              </h1>
              <p className="hero-fade mt-5 flex flex-wrap items-center gap-2 text-xl font-bold text-encre">
                Tous vos
                <span className="relative inline-block h-[1.4em] overflow-hidden rounded-lg bg-violet px-2.5 text-white">
                  <span className="rot-track flex flex-col">
                    {[...ROTATING, ROTATING[0]].map((w, i) => <span key={i} className="block h-[1.4em] leading-[1.4em]">{w}</span>)}
                  </span>
                </span>
                réunis au même endroit.
              </p>
              <p className="hero-fade mt-4 max-w-lg text-lg leading-relaxed text-ardoise">
                SavoirPlus centralise les cours, devoirs et examens de l’Université de Technologie d’Abidjan. Révisez, rattrapez une séance et ne manquez plus aucune échéance.
              </p>
              <div className="hero-fade mt-8 flex flex-wrap gap-3">
                <Link to={cta} className="magnetic btn-primary !px-6 !py-3.5 text-base" id="hero-cta">
                  {user ? 'Accéder à mon espace' : 'Commencer avec mon e-mail UTA'} <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                {!user && <Link to="/connexion" className="magnetic btn-secondary !px-6 !py-3.5 text-base">J’ai déjà un compte</Link>}
              </div>
              <div className="hero-fade mt-10 flex flex-wrap gap-8">
                {[[faLayerGroup, `${MODULES.length}`, 'Modules', 'bg-uta-50 text-uta'], [faFolderOpen, `${seed.resources.length}+`, 'Ressources', 'bg-violet-50 text-violet']].map(([icon, v, l, tone]) => (
                  <div key={l} className="flex items-center gap-3">
                    <span className={`grid size-12 place-items-center rounded-xl text-lg ${tone}`}><FontAwesomeIcon icon={icon} /></span>
                    <span><span className="block text-2xl font-extrabold text-encre">{v}</span><span className="text-sm text-ardoise">{l}</span></span>
                  </div>
                ))}
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ===== Bandeau défilant (vert uni) ===== */}
        <section className="overflow-hidden bg-uta py-4 text-white" aria-hidden="true">
          <div className="marquee-track flex w-max">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {MARQUEE.map((w) => (
                  <span key={w} className="flex items-center gap-6 px-6 text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
                    {w} <span className="marquee-plus inline-block text-white/60">+</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ===== Bandeau (violet uni) ===== */}
        <section className="px-5 py-14">
          <div className="banner relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-violet px-6 py-10 text-white sm:px-10">
            <FontAwesomeIcon icon={faPencil} className="banner-deco absolute right-8 top-6 text-3xl text-white/25" />
            <FontAwesomeIcon icon={faGraduationCap} className="banner-deco absolute bottom-6 right-1/3 text-4xl text-white/20" />
            <span className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-white/15" />
            <span className="pointer-events-none absolute -bottom-20 left-1/4 size-40 rounded-full border border-white/10" />
            <FloatingPlus count={7} colors={['#FFFFFF']} opacity={0.18} />
            <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
              <span className="hidden size-28 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 lg:grid">
                <LogoMark variant="white" size={64} />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Rejoignez la phase pilote de SavoirPlus</h2>
                <p className="mt-2 max-w-xl text-violet-100">Créez votre compte avec votre adresse @uta.ci et retrouvez immédiatement les modules de votre filière et de votre niveau.</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {STATS.map(({ value, label }, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="min-w-20 rounded-xl bg-white/10 px-4 py-2.5 text-center ring-1 ring-white/20">
                        <span className="counter block text-2xl font-extrabold tabular-nums" data-value={value}>{String(value).padStart(2, '0')}</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-violet-100">{label}</span>
                      </div>
                      {i < STATS.length - 1 && <span className="text-xl font-bold text-white/40">·</span>}
                    </div>
                  ))}
                </div>
              </div>
              <Link to={cta} className="magnetic inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-violet shadow-lg transition-colors hover:bg-violet-50" id="banner-cta">
                {user ? 'Mon espace' : 'Créer mon compte'} <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Modules (fond blanc, cartes vertes / violettes unies) ===== */}
        <section id="modules" className="scroll-mt-20 px-5 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="section-title">
                <h2 className="text-3xl font-extrabold tracking-tight text-encre sm:text-4xl"><Chars text="Nos" /> <Circled color="#3FAE5A"><Chars text="modules" /></Circled></h2>
                <p className="mt-2 text-ardoise">Les premiers modules de l’UTA déjà disponibles sur la plateforme.</p>
              </div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un module…" aria-label="Rechercher un module"
                className="input max-w-xs md:hidden" />
            </div>

            {!modules.length ? (
              <p className="mt-10 rounded-2xl border border-dashed border-uta-200 p-10 text-center text-ardoise">Aucun module ne correspond à « {query} ».</p>
            ) : (
              <div ref={gridRef} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((m) => (
                  <article key={m.id} className="mod-card group overflow-hidden rounded-[1.25rem] border border-ligne bg-white shadow-[var(--shadow-card)] transition-[box-shadow,translate] duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                    <div className="relative h-40 overflow-hidden" style={{ background: m.fond }}>
                      <span className="mod-mark absolute -bottom-6 -right-4 block"><LogoMark variant="white" size={150} className="opacity-15 transition duration-500 group-hover:rotate-12 group-hover:scale-110" /></span>
                      <span className="absolute left-5 top-5 text-4xl font-extrabold tracking-tight text-white/90">{m.code}</span>
                      <span className="absolute bottom-4 left-5 flex items-center gap-2 rounded-xl bg-white px-2.5 py-1.5 shadow-md transition duration-300 group-hover:-translate-y-1">
                        <span className="grid size-7 place-items-center rounded-lg text-[0.65rem] font-bold text-white" style={{ background: m.fond }}>{m.initiales}</span>
                        <span className="leading-tight">
                          <span className="block text-[0.7rem] font-extrabold uppercase text-encre">{m.prof}</span>
                          <span className="block text-[0.65rem] text-ardoise">Enseignant</span>
                        </span>
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex gap-2">
                        <span className="badge bg-uta text-white">{m.niveau}</span>
                        <span className="badge bg-violet text-white">{m.semestre}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold leading-snug text-encre">{m.nom}</h3>
                      <div className="mt-4 flex items-center justify-between border-t border-ligne pt-4 text-sm">
                        <span className="flex items-center gap-2 text-ardoise"><FontAwesomeIcon icon={faFolderOpen} className="text-clair" /> {m.ressources} ressource{m.ressources > 1 ? 's' : ''}</span>
                        <Link to={user ? homeFor(user.role) : '/connexion'} className="flex items-center gap-1.5 font-bold text-uta transition-[gap] group-hover:gap-2.5">
                          Accéder <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== Avantages (vert uni) ===== */}
        <section id="avantages" className="relative scroll-mt-20 overflow-hidden bg-uta px-5 py-20 text-white">
          <FloatingPlus count={10} colors={['#FFFFFF']} opacity={0.14} />
          <div className="relative mx-auto max-w-6xl">
            <div className="section-title text-center">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl"><Chars text="Pourquoi" /> <Circled color="#FFFFFF"><Chars text="SavoirPlus" /></Circled> <Chars text="?" /></h2>
              <p className="mt-2 text-uta-100">Simple pour tous, dès la première connexion.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon, title, text }, i) => (
                <div key={title} className="feat-card group rounded-[1.25rem] bg-white p-6 text-encre transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <span className={`feat-icon grid size-12 place-items-center rounded-xl text-lg text-white transition-[rotate,scale] duration-300 group-hover:rotate-12 group-hover:scale-110 ${i % 2 ? 'bg-violet' : 'bg-uta'}`}>
                    <FontAwesomeIcon icon={icon} />
                  </span>
                  <h3 className="mt-4 font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ardoise">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Profils (fond blanc) ===== */}
        <section id="profils" className="scroll-mt-20 px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="section-title">
              <h2 className="text-3xl font-extrabold tracking-tight text-encre sm:text-4xl"><Chars text="Un espace pour" /> <Circled color="#3FAE5A"><Chars text="chacun" /></Circled></h2>
              <p className="mt-2 text-ardoise">Chaque profil retrouve les outils dont il a besoin, rien de plus.</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {PROFILS.map(({ icon, who, color, points }) => (
                <div key={who} className="prof-card group rounded-[1.25rem] border border-ligne bg-white p-7 text-center shadow-[var(--shadow-card)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <span className={`prof-avatar mx-auto grid size-20 place-items-center rounded-full text-3xl text-white transition-[rotate] duration-700 group-hover:rotate-[360deg] ${color}`}><FontAwesomeIcon icon={icon} /></span>
                  <h3 className="mt-4 text-lg font-extrabold uppercase tracking-wide text-encre">{who}</h3>
                  <ul className="mt-4 space-y-2 text-left">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-ardoise"><FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 text-clair" /> {p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter onTop={() => scrollToTarget(0)} />

      <button type="button" onClick={() => scrollToTarget(0)} aria-label="Revenir en haut de la page"
        className="magnetic fixed bottom-5 right-5 z-40 grid size-11 cursor-pointer place-items-center rounded-full bg-violet text-white shadow-lg transition-colors hover:bg-uta">
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </div>
  )
}

/** Visuel du hero : cadre vert uni, anneau violet, aperçu du tableau de bord et bulles flottantes */
function HeroVisual() {
  return (
    <div className="hero-visual relative mx-auto w-full max-w-md lg:max-w-none">
      <span className="hero-ring pointer-events-none absolute -left-10 top-1/2 size-56 -translate-y-1/2 rounded-full border-[18px] border-violet border-r-transparent border-t-transparent" />
      <div className="hero-frame relative -rotate-2 rounded-[2rem] bg-uta p-5 shadow-[var(--shadow-lift)] sm:p-7">
        <div className="rotate-2 rounded-[1.25rem] bg-white p-5 shadow-xl sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ardoise">Bonjour Mariam <FontAwesomeIcon icon={faHand} className="ml-1 text-amber-500" /></p>
              <p className="text-lg font-extrabold text-encre">Vos prochaines échéances</p>
            </div>
            <LogoMark size={34} />
          </div>
          <div className="mt-5 space-y-3">
            {[
              ['IGL202', 'Devoir — Requêtes SQL', 'demain, 18:00', 'bg-red-50 text-red-700', VIOLET, true],
              ['IGL201', 'TP 2 — Gestion de bibliothèque', 'dans 3 jours', 'bg-amber-50 text-amber-800', VERT],
              ['IGL202', 'Examen partiel — BDD', 'dans 9 jours', 'bg-uta-50 text-profond', VIOLET],
            ].map(([code, t, when, tone, c, live]) => (
              <div key={t} className={`hero-row flex items-center gap-3 rounded-2xl border border-ligne p-3 ${live ? 'hero-row-live' : ''}`}>
                <span className="h-10 w-1.5 rounded-full" style={{ background: c }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.7rem] font-bold text-ardoise">{code}</p>
                  <p className="truncate text-sm font-bold text-encre">{t}</p>
                </div>
                <span className={`badge ${tone}`}>{when}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <span className="badge bg-red-50 text-red-600"><FontAwesomeIcon icon={faFileLines} /> Cours PDF</span>
            <span className="badge bg-violet-50 text-violet"><FontAwesomeIcon icon={faFilm} /> Vidéo</span>
          </div>
        </div>
      </div>
      <span className="hero-bubble absolute -right-3 top-10 grid size-12 place-items-center rounded-2xl bg-violet text-white shadow-lg sm:-right-5">
        <FontAwesomeIcon icon={faBell} />
      </span>
      <span className="hero-bubble absolute -bottom-5 right-10 grid size-12 place-items-center rounded-full bg-uta text-white shadow-lg">
        <FontAwesomeIcon icon={faCommentDots} />
      </span>
    </div>
  )
}
