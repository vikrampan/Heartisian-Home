import { useEffect, useRef, useState } from 'react'
import RegisterSheet from './RegisterSheet'
import { availability, callToAction } from './helpers'
import { api, dateRange, onLinkClick, place, rupees, timings, useLoad, useTitle, type Trainer, type Workshop } from './lib'
import { Icon, Loading, Page, Portrait, PRIMARY, Problem, SeatMeter } from './ui'

export default function WorkshopPage({ slug }: { slug: string }) {
  const { data: w, error, loading, reload } = useLoad(`w:${slug}`, () =>
    api<Workshop>(`workshops?slug=${encodeURIComponent(slug)}`),
  )
  const [open, setOpen] = useState(() => window.location.hash === '#register')
  useTitle(w ? `${w.title} — Heartisan Home` : 'Workshop — Heartisan Home')

  if (loading) return <Page><Loading label="Loading the workshop" /></Page>
  if (error || !w) {
    return (
      <Page>
        <Problem title={error?.status === 404 ? 'We could not find that workshop' : 'This page did not load'}>
          <p>{error?.status === 404 ? 'It may have been moved or taken down.' : error?.message}</p>
          <a href="/workshops" onClick={onLinkClick} className={`${PRIMARY} mt-8 h-12 px-7`}>
            See all workshops
          </a>
        </Problem>
      </Page>
    )
  }

  return (
    <Page>
      <Hero w={w} onRegister={() => setOpen(true)} />
      <About w={w} />
      {w.schedule.length > 0 && <Schedule w={w} />}
      {w.trainers.length > 0 && <Trainers trainers={w.trainers} />}
      <Practical w={w} />
      <Closing w={w} onRegister={() => setOpen(true)} />
      <RegisterSheet
        workshop={w}
        open={open}
        onClose={() => {
          setOpen(false)
          // places may have changed while the form was open
          reload()
        }}
      />
    </Page>
  )
}

function Hero({ w, onRegister }: { w: Workshop; onRegister: () => void }) {
  const cta = callToAction(w)
  const status = availability(w)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)

  // phones: once the main button scrolls away, a bar at the bottom keeps it within reach
  useEffect(() => {
    const node = ctaRef.current
    if (!node) return
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting || entry.boundingClientRect.top > 0))
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const facts: { icon: Parameters<typeof Icon>[0]['name']; text: string }[] = [
    { icon: 'calendar', text: dateRange(w.starts_on, w.ends_on) },
    ...(timings(w.daily_start, w.daily_end) ? [{ icon: 'clock' as const, text: timings(w.daily_start, w.daily_end) }] : []),
    { icon: 'pin', text: place(w) },
    { icon: 'rupee', text: w.fee_inr ? `${rupees(w.fee_inr)} per person` : 'Free' },
  ]

  return (
    <section className="paper relative overflow-hidden">
      <div className="container-site grid gap-10 pb-16 pt-8 md:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-24 lg:pt-16">
        <div className="lg:order-1">
          <a href="/workshops" onClick={onLinkClick} className="text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
            All workshops
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
            {w.level && <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-muted">{w.level}</span>}
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.3rem,3.4vw+1.1rem,3.9rem)] leading-[1.06] text-ink [text-wrap:balance]">
            {w.title}
          </h1>
          {w.subtitle && <p className="quote mt-4 text-[1.35rem] leading-snug text-ink/80">{w.subtitle}</p>}

          <ul className="mt-8 grid gap-3 text-[1.0625rem] text-ink sm:grid-cols-2">
            {facts.map((f) => (
              <li key={f.icon} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tan text-terracotta">
                  <Icon name={f.icon} className="h-[1.05rem] w-[1.05rem]" />
                </span>
                <span className="pt-1">{f.text}</span>
              </li>
            ))}
          </ul>

          <div ref={ctaRef} className="mt-9 rounded-2xl bg-white/55 p-5 ring-1 ring-ink/8 sm:p-6">
            <SeatMeter seats={w.seats} taken={w.seats_taken} waitlist={w.waitlist} />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <button type="button" onClick={onRegister} disabled={!w.registration_open} className={`${PRIMARY} h-14 shrink-0 whitespace-nowrap px-8 text-base`}>
                {cta.label}
              </button>
              <p className="text-sm leading-snug text-muted">{cta.note}</p>
            </div>
          </div>
        </div>

        <figure className="relative self-start lg:order-2">
          <img
            src={w.cover_url ?? '/images/hero/hero-wide.webp'}
            alt=""
            className="aspect-[4/3] w-full rounded-2xl object-cover object-[32%_40%] shadow-[0_30px_60px_-34px_rgb(43_38_32/0.75)] lg:aspect-[4/5]"
          />
          {w.format && (
            <figcaption className="absolute -bottom-6 left-4 right-4 rounded-xl bg-moss px-5 py-4 text-paper shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)] sm:left-auto sm:max-w-xs">
              <span className="script block text-[1.45rem] leading-tight text-clay">Hands in the earth</span>
              <span className="mt-1 block text-sm text-paper/85">{w.format}</span>
            </figcaption>
          )}
        </figure>
      </div>

      {w.registration_open && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 py-3 shadow-[0_-12px_30px_-18px_rgb(0_0_0/0.45)] backdrop-blur transition-transform duration-300 lg:hidden ${
            ctaVisible ? 'translate-y-full' : 'translate-y-0'
          }`}
          aria-hidden={ctaVisible}
        >
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-ink">{w.fee_inr ? rupees(w.fee_inr) : 'Free'}</p>
              <p className="truncate text-muted">{w.seats_left ? `${w.seats_left} places left` : 'Waitlist open'}</p>
            </div>
            <button type="button" onClick={onRegister} tabIndex={ctaVisible ? -1 : 0} className={`${PRIMARY} h-12 shrink-0 px-6`}>
              {cta.label}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function About({ w }: { w: Workshop }) {
  if (!w.summary && !w.outcomes.length) return null
  return (
    <section className="paper border-t border-ink/8 py-16 lg:py-24">
      <div className="container-site grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <p className="eyebrow text-muted">About the workshop</p>
          <h2 className="heading mt-4 text-ink">Why take part</h2>
          {w.summary && <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted">{w.summary}</p>}
        </div>
        {w.outcomes.length > 0 && (
          <div>
            <h3 className="font-display text-2xl text-ink">By the end, you will be able to</h3>
            <ol className="mt-6 space-y-4">
              {w.outcomes.map((o, i) => (
                <li key={o} className="flex gap-4 rounded-xl bg-white/50 p-4 ring-1 ring-ink/6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta font-display text-lg text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 leading-relaxed text-ink">{o}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}

function Schedule({ w }: { w: Workshop }) {
  return (
    <section aria-labelledby="schedule" className="moss py-16 text-paper lg:py-24">
      <div className="container-site">
        <p className="eyebrow text-clay">Day by day</p>
        <h2 id="schedule" className="heading mt-4">What you will do</h2>
        <div className={`mt-10 grid gap-6 ${w.schedule.length > 1 ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
          {w.schedule.map((d, i) => (
            <article key={i} className="rounded-2xl bg-paper/[0.06] p-6 ring-1 ring-paper/10 sm:p-8">
              <header className="flex items-baseline gap-4 border-b border-paper/15 pb-5">
                <span className="script text-[2.4rem] leading-none text-clay">Day {i + 1}</span>
                <h3 className="font-display text-[1.45rem] leading-tight">{d.title}</h3>
              </header>
              <ol className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[0.9rem] before:top-2 before:w-px before:bg-paper/20">
                {d.sessions.map((s, j) => (
                  <li key={j} className="relative pl-12">
                    <span className="absolute left-0 top-0 flex h-[1.85rem] w-[1.85rem] items-center justify-center rounded-full bg-moss-deep text-xs font-semibold text-clay ring-1 ring-paper/25">
                      {j + 1}
                    </span>
                    <h4 className="font-semibold leading-snug">{s.title}</h4>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-paper/75">{s.content}</p>
                    {s.method && (
                      <p className="mt-2 inline-block rounded-full bg-paper/10 px-3 py-1 text-xs text-paper/85">{s.method}</p>
                    )}
                  </li>
                ))}
              </ol>
              {d.outputs.length > 0 && (
                <div className="mt-8 rounded-xl bg-paper p-5 text-ink">
                  <p className="eyebrow text-terracotta">You will leave with</p>
                  <ul className="mt-3 space-y-2">
                    {d.outputs.map((o) => (
                      <li key={o} className="flex gap-2.5 text-[0.9375rem] leading-snug">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrainerCard({ t, index }: { t: Trainer; index: number }) {
  const [more, setMore] = useState(false)
  const long = t.bio.length > 260
  return (
    <article className="flex flex-col rounded-2xl bg-white/60 p-6 ring-1 ring-ink/8 sm:p-7">
      <div className="flex items-center gap-4">
        <Portrait trainer={t} index={index} className="h-20 w-20 shrink-0 text-2xl" />
        <div>
          <h3 className="font-display text-[1.5rem] leading-tight text-ink">{t.name}</h3>
          {t.title && <p className="mt-1 text-sm font-semibold text-terracotta">{t.title}</p>}
        </div>
      </div>
      {t.experience && <p className="mt-5 text-sm font-medium text-ink">{t.experience}</p>}
      {t.bio && (
        <div className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          <p className={`whitespace-pre-line ${long && !more ? 'line-clamp-5' : ''}`}>{t.bio}</p>
          {long && (
            <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="mt-2 text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
              {more ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
      {t.expertise.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {t.expertise.slice(0, more ? undefined : 6).map((e) => (
            <li key={e} className="rounded-full bg-tan/70 px-2.5 py-1 text-xs text-ink/80">{e}</li>
          ))}
          {!more && t.expertise.length > 6 && (
            <li className="rounded-full px-2.5 py-1 text-xs text-muted">+{t.expertise.length - 6} more</li>
          )}
        </ul>
      )}
    </article>
  )
}

function Trainers({ trainers }: { trainers: Trainer[] }) {
  return (
    <section aria-labelledby="trainers" className="paper py-16 lg:py-24">
      <div className="container-site">
        <p className="eyebrow text-muted">Your trainers</p>
        <h2 id="trainers" className="heading mt-4 text-ink">Learn from people who build</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trainers.map((t, i) => (
            <TrainerCard key={t.id} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Practical({ w }: { w: Workshop }) {
  const cards: { icon: Parameters<typeof Icon>[0]['name']; title: string; body: string[] }[] = [
    { icon: 'pin', title: 'Where', body: [place(w)] },
    { icon: 'calendar', title: 'When', body: [dateRange(w.starts_on, w.ends_on), timings(w.daily_start, w.daily_end)].filter(Boolean) },
    {
      icon: 'rupee',
      title: 'Fee & payment',
      body: w.fee_inr
        ? [`${rupees(w.fee_inr)} per person.`, `When you register, your place is held for ${w.hold_hours_effective} hours. Pay by UPI and send us the payment reference to confirm it.`]
        : ['Free to attend. Your place is confirmed as soon as you register.'],
    },
    {
      icon: 'bed',
      title: 'Stay & food',
      body: ['Tell us when you register if you would like help arranging a stay at Kanha, and about any food needs.'],
    },
    ...(w.provided.length ? [{ icon: 'tools' as const, title: 'Provided', body: w.provided }] : []),
    ...(w.bring.length ? [{ icon: 'check' as const, title: 'Please bring', body: w.bring }] : []),
  ]
  return (
    <section aria-labelledby="practical" className="paper border-t border-ink/8 py-16 lg:py-24">
      <div className="container-site">
        <p className="eyebrow text-muted">Good to know</p>
        <h2 id="practical" className="heading mt-4 text-ink">Practical details</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl bg-white/55 p-6 ring-1 ring-ink/8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tan text-terracotta">
                <Icon name={c.icon} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{c.title}</h3>
              {c.body.length > 1 && (c.title === 'Provided' || c.title === 'Please bring') ? (
                <ul className="mt-2 space-y-1.5 text-[0.9375rem] leading-relaxed text-muted">
                  {c.body.map((b) => (
                    <li key={b} className="flex gap-2"><span aria-hidden="true" className="text-terracotta">·</span>{b}</li>
                  ))}
                </ul>
              ) : (
                c.body.map((b) => (
                  <p key={b} className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{b}</p>
                ))
              )}
            </div>
          ))}
        </div>

        <div className="earth mt-6 grid gap-6 rounded-2xl p-6 text-paper sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/15">
              <Icon name="shield" />
            </span>
            <h3 className="mt-4 font-display text-2xl">Campus & safety</h3>
            <ul className="mt-4 space-y-2 text-[0.9375rem] leading-relaxed text-paper/90">
              <li>Kanha Shanti Vanam is a substance-free campus: no alcohol, smoking or tobacco.</li>
              <li>Open to everyone aged 18 and over.</li>
              <li>All practical work is introductory and supervised by the trainers.</li>
            </ul>
          </div>
          {w.safety_note && <p className="self-center text-[0.9375rem] leading-relaxed text-paper/85">{w.safety_note}</p>}
        </div>
      </div>
    </section>
  )
}

function Closing({ w, onRegister }: { w: Workshop; onRegister: () => void }) {
  if (!w.registration_open) return null
  const cta = callToAction(w)
  return (
    <section className="moss py-16 text-center text-paper lg:py-20">
      <div className="container-site max-w-2xl">
        <p className="script text-[1.8rem] leading-snug text-clay">
          Build with the Earth. <br className="hidden sm:block" />
          Build with the Heart.
        </p>
        <h2 className="mt-3 font-display text-[clamp(2rem,2.5vw+1.2rem,3rem)] leading-tight">Ready to get your hands dirty?</h2>
        <p className="mt-4 text-paper/80">{cta.note}</p>
        <button type="button" onClick={onRegister} className={`${PRIMARY} mt-8 h-14 px-9 text-base`}>
          {cta.label}
        </button>
      </div>
    </section>
  )
}
