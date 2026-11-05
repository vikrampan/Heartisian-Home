type ArtProps = { className?: string }

// Both are cut from the master logo file. The bird and disc stay crisp on any background and at small sizes.
export function LogoMark({ className }: ArtProps) {
  return <img src="/images/logo/mark.webp" alt="" width={256} height={256} decoding="async" className={className} />
}

// The ring of text around it needs a light background to read, so this one is only for light sections.
export function LogoFull({ className }: ArtProps) {
  return (
    <img
      src="/images/logo/logo-full.webp"
      alt="Heartisan Home logo: a hummingbird in a circle of leaves. Building with Earth. Learning with the Heart."
      width={640}
      height={640}
      loading="lazy"
      decoding="async"
      className={className}
    />
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
