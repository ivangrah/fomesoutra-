/**
 * Logo SavoirPlus — reproduit la charte graphique :
 * livre ouvert (vert clair / vert UTA) surmonté d'une croix violette.
 *
 * variant : "color" (défaut) | "white" (sur fond vert) | "mono" (impression)
 */
const PALETTES = {
  color: { left: '#3FAE5A', right: '#1E7B34', plus: '#5B2A86', text: '#1E7B34', sub: '#4B5563' },
  white: { left: '#D5EEDB', right: '#FFFFFF', plus: '#C9A9E6', text: '#FFFFFF', sub: '#D5EEDB' },
  mono:  { left: '#166029', right: '#166029', plus: '#166029', text: '#166029', sub: '#166029' },
}

export function LogoMark({ size = 40, variant = 'color', className = '' }) {
  const p = PALETTES[variant]
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path d="M3 20.5c5.6-.7 11.4.6 18.5 4.7V46C14.8 42 9 40.6 3 41.2z" fill={p.left} />
      <path d="M25.5 25.2 44 10.5v27.8c-7 1.3-12.7 4.2-18.5 8.2z" fill={p.right} />
      <path d="M30 1h4.4v5.4h5.4v4.4h-5.4v5.4H30v-5.4h-5.4V6.4H30z" fill={p.plus} />
    </svg>
  )
}

export default function Logo({ variant = 'color', size = 'md', withTagline = false, className = '' }) {
  const p = PALETTES[variant]
  const dims = { sm: [28, 'text-lg'], md: [36, 'text-2xl'], lg: [56, 'text-4xl'] }[size]
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={dims[0]} variant={variant} />
      <span className="flex flex-col leading-none">
        <span className={`${dims[1]} font-extrabold tracking-tight`} style={{ color: p.text }}>
          SavoirPlus
        </span>
        {withTagline && (
          <span className="mt-1 text-[0.7rem] font-medium tracking-wide" style={{ color: p.sub }}>
            Plateforme pédagogique UTA
          </span>
        )}
      </span>
    </span>
  )
}
