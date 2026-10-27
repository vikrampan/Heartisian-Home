import LineIcon from './lineIcons'
import { LogoMark } from './art'
import { JOURNEY_STEPS } from '../data/content'

const CIRCLE = 'flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f2e3cd,#d6b893)] text-ink shadow-[inset_0_-6px_14px_rgb(120_80_40/0.18)]'

// Curly brace spanning [x1, x2] (percent of width) that points down at its middle.
const brace = (x1: number, x2: number) => {
  const m = (x1 + x2) / 2
  return `M${x1} 2Q${x1} 14 ${x1 + 4} 14L${m - 4} 14Q${m} 14 ${m} 26Q${m} 14 ${m + 4} 14L${x2 - 4} 14Q${x2} 14 ${x2} 2`
}

export function ScaleDiagramDesktop() {
  return (
    <div className="hidden md:block">
      <ol className="grid grid-cols-4 gap-7">
        {JOURNEY_STEPS.map((step, index) => (
          <li key={step.title} className="relative">
            {/* a thread between the steps, level with the circles */}
            {index > 0 && <span aria-hidden="true" className="absolute -left-7 top-14 h-px w-7 bg-ink/30" />}
            <div className="flex h-full flex-col items-center rounded-lg bg-white/35 px-3 pb-6 pt-5 text-center">
              <span className={`${CIRCLE} h-[4.5rem] w-[4.5rem]`}>
                <LineIcon name={step.icon} className="h-9 w-9" />
              </span>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.1em] text-ink">{step.title}</h3>
              <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">{step.caption}</p>
            </div>
          </li>
        ))}
      </ol>
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-1 h-10 w-full text-umber/55" aria-hidden="true">
        <path d={`${brace(6, 44)}${brace(56, 94)}`} fill="none" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="grid grid-cols-2 text-center">
        <p className="quote text-[1.35rem] text-ink">Heartisan Home</p>
        <p>
          <span className="block text-sm font-bold tracking-[0.1em] text-ink">SKIL</span>
          <span className="text-xs text-muted">Shanti Kunj Infrastructure Limited</span>
        </p>
      </div>
    </div>
  )
}

export function ScaleDiagramMobile() {
  return (
    <div className="md:hidden">
      <div className="relative">
        <span aria-hidden="true" className="absolute bottom-10 left-[2.625rem] top-10 w-px bg-ink/25" />
        <ol className="relative space-y-6">
        {JOURNEY_STEPS.map((step) => (
          <li key={step.title} className="relative flex items-center gap-5">
            <span className={`${CIRCLE} h-[5.25rem] w-[5.25rem]`}>
              <LineIcon name={step.icon} className="h-10 w-10" />
            </span>
            <div>
              <h3 className="text-[0.95rem] font-bold uppercase tracking-[0.1em] text-ink">{step.title}</h3>
              <p className="mt-1 text-[0.95rem] leading-snug text-muted">{step.caption}</p>
            </div>
          </li>
        ))}
        </ol>
      </div>
      <div className="mt-10 flex items-center justify-between gap-4 text-ink">
        <span className="flex flex-col items-center gap-2 text-center text-sm">
          <LogoMark className="h-11 w-11" />
          Heartisan Home
        </span>
        <span aria-hidden="true" className="relative mb-6 h-px flex-1 bg-ink/40">
          <span className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-ink/60" />
          <span className="absolute -right-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-ink/60" />
        </span>
        <span className="sr-only">leads to</span>
        <span className="flex flex-col items-center gap-2 text-center">
          <LineIcon name="skil" className="h-11 w-11" />
          <span className="text-sm font-bold tracking-[0.1em]">SKIL</span>
        </span>
      </div>
    </div>
  )
}
