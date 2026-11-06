type ArtProps = { className?: string }

interface LogoFullProps extends ArtProps {
  /** Rendered width, so the browser can pick the right file. */
  sizes: string
  alt?: string
  eager?: boolean
}

// The supplied logo, unchanged. Beside its name in text it is decorative, so `alt` defaults to empty.
export function LogoFull({ className, sizes, alt = '', eager = false }: LogoFullProps) {
  return (
    <img
      src="/images/logo/logo-full.webp"
      srcSet="/images/logo/logo-320.webp 320w, /images/logo/logo-full.webp 640w"
      sizes={sizes}
      alt={alt}
      width={640}
      height={640}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}

// On photos: a soft pool of shade behind the logo keeps its olive and blue lettering readable.
export function LogoOnShade({ className = '', ...logo }: LogoFullProps) {
  return (
    <span
      className={`relative isolate block shrink-0 before:absolute before:-inset-[14%] before:-z-10 before:rounded-full before:bg-[radial-gradient(closest-side,rgb(18_12_8/0.78),rgb(18_12_8/0.6)_72%,transparent)] ${className}`}
    >
      <LogoFull {...logo} className="h-full w-full" />
    </span>
  )
}

// One leaf as a closed almond outline plus midrib and veins.
function leaf(x: number, y: number, angle: number, length: number, width: number) {
  const a = (angle * Math.PI) / 180
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  const px = -dy
  const py = dx
  const at = (t: number, side: number, w: number) =>
    `${(x + dx * length * t + px * w * side).toFixed(1)} ${(y + dy * length * t + py * w * side).toFixed(1)}`
  const tip = at(1, 0, 0)
  let d = `M${x} ${y}C${at(0.3, 1, width)} ${at(0.75, 1, width * 0.75)} ${tip}C${at(0.75, -1, width * 0.75)} ${at(0.3, -1, width)} ${x} ${y}Z`
  d += `M${x} ${y}L${tip}`
  for (const t of [0.32, 0.52, 0.72]) {
    d += `M${at(t, 0, 0)}L${at(t + 0.14, 1, width * 0.6)}M${at(t, 0, 0)}L${at(t + 0.14, -1, width * 0.6)}`
  }
  return d
}

const SPRIG = [
  'M60 236C57 176 63 112 60 18',
  leaf(60, 200, -148, 50, 13),
  leaf(60, 174, -32, 52, 13),
  leaf(60, 144, -152, 46, 12),
  leaf(60, 118, -28, 46, 12),
  leaf(60, 90, -146, 40, 11),
  leaf(60, 66, -34, 40, 11),
  leaf(60, 40, -120, 30, 9),
  leaf(60, 22, -84, 26, 8),
].join('')

export function BotanicalSprig({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 240" fill="none" className={className} aria-hidden="true">
      <path d={SPRIG} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
