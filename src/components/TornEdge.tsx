// Deterministic pseudo-random so the tear looks the same on every render.
function random(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function tear(seed: number, depth: number) {
  const r = random(seed)
  let d = `M0 40L0 ${(10 + r() * 6).toFixed(1)}`
  for (let x = 0; x < 1200; ) {
    x = Math.min(1200, x + 5 + r() * 16)
    const notch = r() < 0.07 ? depth * 0.6 : 0
    d += `L${x.toFixed(1)} ${(2 + r() * depth + notch).toFixed(1)}`
  }
  return `${d}L1200 40Z`
}

const RIM = tear(11, 14)
const FACE = tear(29, 12)

const PLACEMENTS = {
  // overlaps the section above, like torn paper laid on top of it
  above: 'bottom-full translate-y-px',
  // paper tearing down into the top of a photo
  'top-inside': 'top-0 -translate-y-px -scale-y-100',
  // paper tearing up into the bottom of a photo
  'bottom-inside': 'bottom-0 translate-y-px',
} as const

interface TornEdgeProps {
  placement?: keyof typeof PLACEMENTS
  className?: string
  rimClassName?: string
}

export default function TornEdge({ placement = 'above', className = 'text-paper', rimClassName = 'text-white/60' }: TornEdgeProps) {
  return (
    <svg
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 h-4 w-full sm:h-6 ${PLACEMENTS[placement]} ${className}`}
    >
      <path d={RIM} className={rimClassName} fill="currentColor" transform="translate(0 -3)" />
      <path d={FACE} fill="currentColor" />
    </svg>
  )
}
