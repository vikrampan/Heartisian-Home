type IconProps = { className?: string }

const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function IconArrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" {...line} strokeWidth="1.6" />
    </svg>
  )
}

export function IconArrowDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3v17M7 15l5 5 5-5" {...line} strokeWidth="1.4" />
    </svg>
  )
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8.5 5.8v12.4L18.5 12z" fill="currentColor" />
    </svg>
  )
}

export function IconClose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" {...line} strokeWidth="1.5" />
    </svg>
  )
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 6.5h18M3 12h18M3 17.5h18" {...line} strokeWidth="1.4" />
    </svg>
  )
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" {...line} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" {...line} strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function IconYoutube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 9.2v5.6l4.8-2.8z"
      />
    </svg>
  )
}

export function IconLinkedin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 7v7h2.6v-7zm1.3-3.8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11.3 10v7h2.6v-3.6c0-1 .5-1.6 1.3-1.6s1.2.6 1.2 1.6V17H19v-4c0-2-.9-3.2-2.8-3.2-1.1 0-2 .5-2.4 1.2v-1z"
      />
    </svg>
  )
}
