import type { Tone } from '../data/media'

const TONES: Record<Tone, string> = {
  earth: 'bg-[linear-gradient(160deg,#6b4630_0%,#3b2618_60%,#24170f_100%)]',
  clay: 'bg-[linear-gradient(155deg,#b98257_0%,#8f5b3b_55%,#5e3a26_100%)]',
  lime: 'bg-[linear-gradient(150deg,#efe8dc_0%,#d9cdb9_60%,#bfb19a_100%)]',
  stone: 'bg-[linear-gradient(150deg,#cfc7b8_0%,#a39a8a_60%,#6f675b_100%)]',
  soil: 'bg-[linear-gradient(155deg,#8a5a3b_0%,#5e3b26_60%,#3a2417_100%)]',
  forest: 'bg-[linear-gradient(172deg,#cdbf9f_0%,#8d9466_26%,#566339_58%,#2f3a22_100%)]',
  lake: 'bg-[linear-gradient(176deg,#d8cdb6_0%,#9aa7a2_30%,#56768b_48%,#56623a_70%,#2f3a22_100%)]',
  dusk: 'bg-[linear-gradient(176deg,#e3cdb0_0%,#b48a64_45%,#6e4b33_100%)]',
}

const LIGHT: Record<Tone, boolean> = {
  earth: false,
  clay: false,
  lime: true,
  stone: true,
  soil: false,
  forest: false,
  lake: false,
  dusk: false,
}

export type LabelPosition = 'bottom-left' | 'top-right' | 'none'

interface ImagePlaceholderProps {
  tone: Tone
  label: string
  labelPosition?: LabelPosition
  className?: string
}

export default function ImagePlaceholder({ tone, label, labelPosition = 'bottom-left', className = '' }: ImagePlaceholderProps) {
  const light = LIGHT[tone]
  // A caller-supplied position (e.g. "absolute inset-0") must win over the default `relative`.
  const needsRelative = !/\b(absolute|fixed|sticky)\b/.test(className)

  return (
    <div
      role="img"
      aria-label={`Photo placeholder — ${label}`}
      className={`grain ${needsRelative ? 'relative' : ''} overflow-hidden ${TONES[tone]} ${className}`}
    >
      {labelPosition !== 'none' && (
        <span
          className={`absolute z-10 flex max-w-[85%] items-center gap-2 rounded-full px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${
            labelPosition === 'top-right' ? 'right-3 top-3' : 'bottom-3 left-3'
          } ${light ? 'bg-ink/10 text-ink/70' : 'bg-black/25 text-paper/80'}`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
            <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="truncate">{label}</span>
        </span>
      )}
    </div>
  )
}
