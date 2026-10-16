type IconProps = { className?: string }

const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

// marks the one link that leaves the page
export function IconExternal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" {...line} strokeWidth="1.6" />
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
