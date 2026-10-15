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
