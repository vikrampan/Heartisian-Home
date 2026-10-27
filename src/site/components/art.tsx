import { useId } from 'react'

type ArtProps = { className?: string }

export function LogoMark({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" className={className} aria-hidden="true">
      <LogoMarkPaths />
    </svg>
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

export function Stamp({ className }: ArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ring = `stamp-ring-${uid}`
  const ink = `stamp-ink-${uid}`

  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <defs>
        <path id={ring} d="M80 80m-63 0a63 63 0 1 1 126 0a63 63 0 1 1-126 0" />
        <filter id={ink} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 1.7" result="speckle" />
          <feComposite in="SourceGraphic" in2="speckle" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${ink})`} stroke="currentColor">
        <circle cx="80" cy="80" r="76" strokeWidth="2.2" />
        <circle cx="80" cy="80" r="71" strokeWidth="0.9" />
        <circle cx="80" cy="80" r="50" strokeWidth="1.2" />
        <text fill="currentColor" stroke="none" fontSize="10" fontWeight="700" letterSpacing="1.5" className="font-sans">
          <textPath href={`#${ring}`} textLength="390" lengthAdjust="spacing">
            HEARTISAN HOME · BUILDING WITH EARTH · LEARNING WITH THE HEART ·
          </textPath>
        </text>
        <g transform="translate(56 54)">
          <LogoMarkPaths />
        </g>
      </g>
    </svg>
  )
}

function LogoMarkPaths() {
  return (
    <g strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 42C14 40 8 32 9 21c7 1 12.5 5 15 11" />
      <path d="M24 42c10-2 16-10 15-21-7 1-12.5 5-15 11" />
      <path d="M24 42c-5.5-5-7-13-.5-22 6.5 9 5 17 .5 22z" />
      <path d="M24 20v-5M24 13.5c-1.2-2.4-5-2-4.4.8.4 1.8 4.4 4.2 4.4 4.2s4-2.4 4.4-4.2c.6-2.8-3.2-3.2-4.4-.8z" />
    </g>
  )
}
