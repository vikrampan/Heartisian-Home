import type { ReactNode } from 'react'
import Footer from '../site/components/Footer'
import { LogoOnShade } from '../site/components/art'
import { initials, onLinkClick, type Trainer } from './lib'

// Pieces shared by the workshop pages: the page frame, the seat meter, trainer portraits and icons.

export function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-paper focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>
      <header className="moss sticky top-0 z-50 text-paper shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)]">
        <div className="container-site flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
          <a href="/" className="flex items-center gap-3" aria-label="Heartisan Home — home page">
            <LogoOnShade eager sizes="4rem" className="h-14 w-14 md:h-16 md:w-16" />
            <span className="hidden font-sans text-[0.95rem] font-semibold uppercase tracking-[0.12em] sm:block">
              Heartisan Home
            </span>
          </a>
          <nav aria-label="Workshops">
            <ul className="flex items-center gap-1 text-[0.9375rem] sm:gap-2">
              <li>
                <a href="/" className="rounded-full px-3 py-2 text-paper/85 transition-colors hover:text-paper">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/workshops"
                  onClick={onLinkClick}
                  className="rounded-full bg-paper/10 px-4 py-2 text-paper ring-1 ring-inset ring-paper/25 transition-colors hover:bg-paper/20"
                >
                  All workshops
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="content">{children}</main>
      <Footer linkBase="/" />
    </>
  )
}

// Places drawn as earth blocks laid in courses (stretcher bond): laid blocks are taken, outlined ones are free.
export function SeatMeter({
  seats,
  taken,
  waitlist = 0,
  size = 'md',
  tone = 'light',
}: {
  seats: number
  taken: number
  waitlist?: number
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark'
}) {
  // up to 40 blocks; beyond that each block stands for several places
  const per = Math.max(1, Math.ceil(seats / 40))
  const blocks = Math.ceil(seats / per)
  const laid = Math.min(blocks, Math.round(taken / per))
  const perCourse = blocks <= 12 ? blocks : Math.ceil(blocks / Math.ceil(blocks / 10))
  const courses = Array.from({ length: Math.ceil(blocks / perCourse) }, (_, c) =>
    Array.from({ length: Math.min(perCourse, blocks - c * perCourse) }, (_, i) => c * perCourse + i),
  )
  const left = Math.max(seats - taken, 0)
  const brick = size === 'sm' ? 'h-[0.6rem] w-[1.15rem]' : 'h-3 w-[1.45rem] sm:w-6'
  const half = size === 'sm' ? '0.65rem' : '0.82rem'
  const dark = tone === 'dark'

  return (
    <div>
      <div aria-hidden="true" className="inline-flex flex-col gap-[3px]">
        {courses.map((course, c) => (
          <div key={c} className="flex gap-[3px]" style={{ marginLeft: c % 2 ? half : 0 }}>
            {course.map((i) => (
              <span
                key={i}
                className={`${brick} rounded-[2px] ${
                  i < laid
                    ? 'bg-[linear-gradient(160deg,#c07a50,#9f5738_55%,#84452b)] shadow-[inset_0_-1px_0_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.2)]'
                    : dark
                      ? 'border border-dashed border-paper/40'
                      : 'border border-dashed border-ink/30 bg-white/40'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className={`mt-2 text-sm ${dark ? 'text-paper/85' : 'text-muted'}`}>
        {left > 0 ? (
          <>
            <span className={`font-semibold ${dark ? 'text-paper' : 'text-ink'}`}>
              {left} {left === 1 ? 'place' : 'places'} left
            </span>{' '}
            · {taken} of {seats} blocks laid
          </>
        ) : (
          <>
            <span className={`font-semibold ${dark ? 'text-paper' : 'text-ink'}`}>All {seats} places taken</span>
            {' · '}
            {waitlist ? `${waitlist} on the waitlist` : 'waitlist open'}
          </>
        )}
      </p>
    </div>
  )
}

const PORTRAIT_TONES = [
  'bg-[radial-gradient(circle_at_30%_25%,#d8a679,#9f5738_70%)]',
  'bg-[radial-gradient(circle_at_30%_25%,#b8b48f,#6f6a45_70%)]',
  'bg-[radial-gradient(circle_at_30%_25%,#9fb3bf,#56768b_70%)]',
]

// A trainer's photo, or their initials on an earth-toned disc until the photo arrives.
export function Portrait({ trainer, index = 0, className = '' }: { trainer: Trainer; index?: number; className?: string }) {
  if (trainer.photo_url) {
    return <img src={trainer.photo_url} alt="" loading="lazy" className={`rounded-full object-cover ${className}`} />
  }
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full font-display text-paper ${PORTRAIT_TONES[index % 3]} ${className}`}
    >
      {initials(trainer.name)}
    </span>
  )
}

type IconName = 'calendar' | 'clock' | 'pin' | 'rupee' | 'people' | 'check' | 'copy' | 'close' | 'leaf' | 'bed' | 'shield' | 'tools' | 'phone'

const PATHS: Record<IconName, ReactNode> = {
  calendar: <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM4 10h16M8.5 4v4M15.5 4v4" />,
  clock: <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v4.5l3 2" />,
  pin: <path d="M12 21s6.5-6.1 6.5-11.2A6.5 6.5 0 0 0 5.5 9.8C5.5 14.9 12 21 12 21zM12 12.3a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z" />,
  rupee: <path d="M7 5h10M7 9h10M9.5 5c3.2 0 5 1.6 5 4s-1.8 4-5 4H7l7.5 7" />,
  people: <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.6 2.7-6 6-6s6 2.4 6 6M16 11a3 3 0 1 0-1-5.8M17 14c2.5.4 4 2.6 4 5.5" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  copy: <path d="M9 9h10v11H9zM5 15V4h10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  leaf: <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7" />,
  bed: <path d="M3 18V7M3 14h18v4M21 14v-2.5a2.5 2.5 0 0 0-2.5-2.5H11v5M7 12.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z" />,
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6zM9 12l2 2 4-4" />,
  tools: <path d="M14.5 6.5l3 3M4 20l7.5-7.5M13 4.5a3.5 3.5 0 0 0 4.9 4.9L20 11.5l-3.5 3.5-2-2-5 5L4 12.5l5-5-2-2L10.5 2z" />,
  phone: <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2" />,
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[50vh] items-center justify-center gap-3 text-muted">
      <Spinner />
      {label}…
    </div>
  )
}

export function Problem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-site flex min-h-[55vh] max-w-2xl flex-col items-center justify-center py-20 text-center">
      <p className="script text-[2rem] text-terracotta">Oh dear</p>
      <h1 className="heading mt-2 text-ink">{title}</h1>
      <div className="mt-4 text-[1.0625rem] leading-relaxed text-muted">{children}</div>
    </div>
  )
}

export const BUTTON =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60'
export const PRIMARY = `${BUTTON} bg-terracotta text-white hover:bg-[#84452b]`
export const SECONDARY = `${BUTTON} border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper`
