import { useEffect, useState, type ReactNode } from 'react'
import FilmPlayer from '../shared/FilmPlayer'
import { FILM } from '../film'
import LineIcon from '../site/components/lineIcons'
import { LogoMark } from '../site/components/art'
import { JOURNEY_STEPS, PILLARS, TECHNIQUES } from '../site/data/content'

// The basic landing page: a standard single-page layout with no photography, built around the film.
// Text comes from the same content file as the full site.

const NAV = [
  { label: 'Our Story', href: '#film' },
  { label: 'About', href: '#about' },
  { label: 'Materials', href: '#materials' },
  { label: 'Why Us', href: '#why' },
  { label: 'Journey', href: '#journey' },
  { label: 'KSV', href: '#ksv' },
]

// Learn and Train happen at Heartisan Home; Build and Scale are taken forward by SKIL.
const STEP_OWNER = ['Heartisan Home', 'Heartisan Home', 'SKIL', 'SKIL']

const year = new Date().getFullYear()

function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 5.5v13L18.5 12z" fill="currentColor" />
    </svg>
  )
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title mt-3">{title}</h2>
      {children && <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted [text-wrap:pretty]">{children}</p>}
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/95 backdrop-blur phone-landscape:static">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-terracotta" />
          <span className="text-[1.05rem] font-extrabold tracking-tight">Heartisan Home</span>
        </a>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.9375rem] font-medium text-ink/75">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-terracotta">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <a href="#watch" className="btn btn-primary h-10 px-4 text-sm">
            Watch Film
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
              <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Sections" className="border-t border-ink/10 bg-white lg:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-ink/5 py-3.5 font-semibold last:border-0"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

export default function BasicApp() {
  return (
    <>
      <Header />

      <main>
        {/* ---- hero ---- */}
        <section id="top" className="bg-[linear-gradient(180deg,var(--color-cream),#fff)] px-5 pb-12 pt-14 text-center md:pb-16 md:pt-24">
          <p className="inline-block rounded-full bg-terracotta/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            Kanha Shanti Vanam
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-[clamp(2.25rem,5.5vw+1rem,4rem)] font-extrabold leading-[1.08] tracking-[-0.02em] [text-wrap:balance]">
            <span className="block">Building with Earth.</span> <span className="block text-terracotta">Learning with the Heart.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
            A journey into natural construction, skilled craftsmanship and ecological living at Kanha Shanti Vanam.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a href="#watch" className="btn btn-primary h-14 px-7 text-base">
              <IconPlay className="h-5 w-5" />
              Watch Our Story
            </a>
            <span className="text-sm text-muted">{FILM.minutes} minute film</span>
          </div>
          <ul className="mx-auto mt-10 flex w-fit flex-col items-start gap-3 text-[0.9375rem] font-semibold sm:flex-row sm:items-center sm:gap-8">
            {['Hands-on training', 'Earth and lime', 'Ecological living'].map((point) => (
              <li key={point} className="flex items-center gap-2">
                <IconCheck className="h-5 w-5 text-terracotta" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* ---- the film ---- */}
        <section id="film" className="px-5 pb-16 pt-10 md:pb-24 md:pt-14">
          <SectionHeading eyebrow={`Our Story · ${FILM.minutes} minute film`} title="The Heart Behind Our Homes.">
            A {FILM.minutes} minute film that takes you through our philosophy, process, people and the places that inspire
            us.
          </SectionHeading>
          {/* edge to edge on phones; on laptops sized so the whole film fits on screen under the header */}
          <div id="watch" className="-mx-5 mt-10 scroll-mt-20 sm:mx-auto sm:max-w-5xl phone-landscape:scroll-mt-0">
            <FilmPlayer className="w-[min(100%,calc(100svh*16/9))] sm:rounded-xl sm:shadow-[0_24px_60px_-28px_rgb(43_38_32/0.55)] md:w-[min(100%,calc((100svh-7rem)*16/9))] phone-landscape:w-[min(100%,calc(100svh*16/9))] phone-landscape:rounded-none" />
          </div>
          <p className="mt-4 text-center text-sm text-muted">Best watched with the sound on.</p>
        </section>

        {/* ---- about ---- */}
        <section id="about" className="bg-cream px-5 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-3">
            <div>
              <p className="eyebrow">The Initiative</p>
              <h2 className="section-title mt-3">Learning to Build with Nature</h2>
            </div>
            <div className="space-y-4 text-[1.0625rem] leading-relaxed text-muted md:pt-7">
              <p>Heartisan Home promotes hands-on training in natural construction techniques using earth and lime.</p>
              <p>
                The initiative brings together traditional knowledge, practical skills and contemporary sustainable
                construction practices, creating opportunities for both skilled and unskilled workers to learn,
                experiment and build.
              </p>
            </div>
          </div>
        </section>

        {/* ---- materials ---- */}
        <section id="materials" className="px-5 py-16 md:py-24">
          <SectionHeading eyebrow="The Craft" title="Earth. Lime. People.">
            Time-tested materials. Contemporary possibilities.
          </SectionHeading>
          <ul className="mx-auto mt-10 flex max-w-6xl flex-wrap justify-center gap-4 md:mt-12">
            {TECHNIQUES.map((technique, index) => (
              <li
                key={technique.id}
                className="w-full rounded-xl border border-ink/10 bg-white p-6 shadow-[0_6px_20px_-12px_rgb(43_38_32/0.25)] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-4rem)/5)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta/10 text-sm font-extrabold text-terracotta">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-bold leading-snug">{technique.name}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-snug text-muted">{technique.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- why ---- */}
        <section id="why" className="bg-cream px-5 py-16 md:py-24">
          <SectionHeading
            eyebrow="The Heartisan Home Difference"
            title={
              <>
                A Different Place to Learn. <br className="hidden sm:block" />A Different Way to Build.
              </>
            }
          />
          <ul className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="rounded-xl bg-white p-6 shadow-[0_6px_20px_-12px_rgb(43_38_32/0.25)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta">
                  <LineIcon name={pillar.icon} className="h-8 w-8" />
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-bold">{pillar.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- journey ---- */}
        <section id="journey" className="px-5 py-16 md:py-24">
          <SectionHeading eyebrow="From Learning to Scale" title="Building a Sustainable Future at Scale">
            The experience and knowledge developed through Heartisan Home can contribute to a larger movement towards
            natural and sustainable construction. Shanti Kunj Infrastructure Limited (SKIL) is the community construction
            initiative working to take these approaches forward into larger-scale construction and infrastructure.
          </SectionHeading>
          <ol className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col rounded-xl border border-ink/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-ink">
                    <LineIcon name={step.icon} className="h-7 w-7" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-[1.0625rem] font-bold">{step.title}</h3>
                <p className="mt-1.5 flex-1 text-[0.9375rem] leading-snug text-muted">{step.caption}</p>
                <p className="mt-4 self-start rounded-full bg-cream px-3 py-1 text-xs font-bold text-terracotta">
                  {STEP_OWNER[index]}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---- KSV ---- */}
        <section id="ksv" className="bg-cream px-5 py-16 md:py-24">
          <SectionHeading eyebrow="Kanha Shanti Vanam" title="More Than a Township">
            Kanha Shanti Vanam is a living environment where people, nature and inner development come together. Its
            approach to township planning reflects a strong emphasis on ecological and sustainable development. The
            township received IGBC Platinum recognition for township planning in 2019.
          </SectionHeading>
          <blockquote className="mx-auto mt-10 max-w-2xl rounded-xl border-l-4 border-terracotta bg-white p-6 text-[1.0625rem] italic leading-relaxed md:p-8 md:text-lg">
            “A place where sustainable development goes beyond buildings — embracing the way we live, learn, connect and
            evolve.”
          </blockquote>
          <div className="mt-8 text-center">
            <a href="https://heartfulness.org/kanha/" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Explore KSV
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </section>

        {/* ---- closing call to action ---- */}
        <section aria-labelledby="cta-title" className="bg-moss px-5 py-16 text-center text-white md:py-20">
          <h2 id="cta-title" className="text-[clamp(1.75rem,2.4vw+1rem,2.5rem)] font-extrabold leading-tight">
            See the story for yourself
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80 [text-wrap:balance]">
            Our philosophy, process, people and the places that inspire us, in a {FILM.minutes} minute film.
          </p>
          <a href="#watch" className="btn btn-light mt-8 h-14 px-7 text-base">
            <IconPlay className="h-5 w-5 text-terracotta" />
            Watch Our Story
          </a>
        </section>
      </main>

      <footer className="bg-ink px-5 pb-8 pt-12 text-white/70">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div>
            <p className="flex items-center gap-2.5 text-white">
              <LogoMark className="h-8 w-8" />
              <span className="text-[1.05rem] font-extrabold">Heartisan Home</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Building with Earth. Learning with the Heart. Natural construction training at Kanha Shanti Vanam.
            </p>
          </div>
          <nav aria-label="Footer" className="md:justify-self-end">
            <ul className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/50">
          &copy; {year} Heartisan Home. All rights reserved.
        </p>
      </footer>
    </>
  )
}
