import { useEffect, useState, type ReactNode } from 'react'
import RegisterSheet from './RegisterSheet'
import { availability, bookingSteps, callToAction, dayCount, startsIn } from './helpers'
import { api, dateRange, feeLabel, onLinkClick, rupees, timings, useLoad, useTitle, type Trainer, type Workshop } from './lib'
import { ACCENTS, GALLERY, PHOTOS, coverFor, sessionPhoto } from './photos'
import { Icon, Page, Portrait, PRIMARY, Problem } from './ui'

// A workshop's page, laid out the way people are used to booking an experience: the essentials at a glance, real
// photographs from the Heartisan Home film, the story below, and a booking card that stays within reach (beside the
// content on computers, as a bar at the bottom on phones).

export default function WorkshopPage({ slug }: { slug: string }) {
  const { data: w, error, loading, reload } = useLoad(`w:${slug}`, () =>
    api<Workshop>(`workshops?slug=${encodeURIComponent(slug)}`),
  )
  const [open, setOpen] = useState(() => window.location.hash === '#register')
  useTitle(w ? `${w.title} — Heartisan Home` : 'Workshop — Heartisan Home')

  if (loading) return <Page><Skeleton /></Page>
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

  const register = () => setOpen(true)

  return (
    <Page>
      <article className="paper pb-20">
        <Intro w={w} />
        <div className="container-site mt-8 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-16 md:space-y-20">
            <Glance w={w} />
            <BookingCard w={w} onRegister={register} variant="inline" />
            <HowItWorks w={w} />
            <About w={w} />
            <TakeHome w={w} />
            {w.schedule.length > 0 && <Schedule w={w} />}
            {w.trainers.length > 0 && <Trainers trainers={w.trainers} />}
            <Practical w={w} />
            <Faq w={w} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <BookingCard w={w} onRegister={register} variant="side" />
            </div>
          </aside>
        </div>
      </article>
      <Closing w={w} onRegister={register} />
      <MobileBar w={w} onRegister={register} />
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

// ---- top ----

function Intro({ w }: { w: Workshop }) {
  const status = availability(w)
  const days = dayCount(w)
  const soon = startsIn(w)
  return (
    <header className="container-site pt-8 md:pt-12">
      <a href="/workshops" onClick={onLinkClick} className="text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
        All workshops
      </a>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
        {w.level && <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-muted">{w.level}</span>}
        {soon && (
          <span className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-muted">
            <Icon name="hourglass" className="h-3.5 w-3.5" />
            {soon}
          </span>
        )}
      </div>
      <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,3.6vw+1rem,4.1rem)] leading-[1.05] text-ink [text-wrap:balance]">
        {w.title}
      </h1>
      {w.subtitle && <p className="quote mt-3 max-w-3xl text-[1.3rem] leading-snug text-ink/75 md:text-[1.45rem]">{w.subtitle}</p>}
      <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem] text-ink">
        <span className="flex items-center gap-2">
          <Icon name="calendar" className="h-[1.1rem] w-[1.1rem] text-terracotta" />
          {dateRange(w.starts_on, w.ends_on)}
        </span>
        <span className="flex items-center gap-2">
          <Icon name="pin" className="h-[1.1rem] w-[1.1rem] text-terracotta" />
          {w.venue}
        </span>
        {days && (
          <span className="flex items-center gap-2">
            <Icon name="sun" className="h-[1.1rem] w-[1.1rem] text-terracotta" />
            {days} {days === 1 ? 'day' : 'days'}
          </span>
        )}
      </p>

      <Gallery w={w} />
    </header>
  )
}

/** Computers: a mosaic, one large photo and four small. Phones: a strip to swipe through. */
function Gallery({ w }: { w: Workshop }) {
  const cover = coverFor(w)
  const photos = [cover, ...GALLERY.filter((p) => p.src !== cover.src)].slice(0, 5)
  const [index, setIndex] = useState(0)
  return (
    <>
      <div className="relative mt-7 md:hidden">
        <ul
          onScroll={(e) => {
            const el = e.currentTarget
            const item = el.firstElementChild as HTMLElement | null
            if (item) setIndex(Math.round(el.scrollLeft / (item.offsetWidth + 8)))
          }}
          aria-label="Photos"
          className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-6 px-6"
        >
          {photos.map((p, i) => (
            <li key={p.src} className="w-[86%] shrink-0 snap-start overflow-hidden rounded-2xl bg-ink/10">
              <img src={p.src} srcSet={p.srcSet || undefined} sizes="86vw" alt={p.alt} loading={i ? 'lazy' : 'eager'} style={{ objectPosition: p.focus }} className="aspect-[3/2] w-full object-cover" />
            </li>
          ))}
        </ul>
        <span aria-hidden="true" className="absolute right-3 top-3 rounded-full bg-ink/55 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur">
          {index + 1} / {photos.length}
        </span>
      </div>

      <div className="mt-9 hidden h-[26rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl bg-ink/10 md:grid lg:h-[31rem]">
        {photos.map((p, i) => (
          <figure key={p.src} className={`group relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
            <img
              src={p.src}
              srcSet={p.srcSet || undefined}
              sizes={i === 0 ? '(min-width: 1280px) 600px, 50vw' : '(min-width: 1280px) 300px, 25vw'}
              alt={p.alt}
              loading={i ? 'lazy' : 'eager'}
              style={{ objectPosition: p.focus }}
              className="h-full w-full object-cover transition-transform duration-[1.4s] ease-soft group-hover:scale-[1.03]"
            />
          </figure>
        ))}
      </div>
    </>
  )
}

function Glance({ w }: { w: Workshop }) {
  const where = w.venue_address && w.venue_address !== w.venue ? w.venue_address.replace(`${w.venue}, `, '') : ''
  const [formatMain, ...formatRest] = w.format.split(' · ')
  const tiles: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string; note?: string }[] = [
    { icon: 'calendar', label: 'When', value: dateRange(w.starts_on, w.ends_on), note: timings(w.daily_start, w.daily_end) },
    { icon: 'pin', label: 'Where', value: w.venue, note: where },
    { icon: 'tools', label: 'Format', value: formatMain || 'Hands-on', note: formatRest.join(' · ') },
    { icon: 'layers', label: 'Level', value: w.level || 'Open to all', note: 'No experience needed' },
  ]
  return (
    <section aria-label="At a glance" className="grid grid-cols-2 gap-3">
      {tiles.map((t, i) => (
        <div key={t.label} className="rounded-2xl bg-white/70 p-4 ring-1 ring-ink/8 sm:p-5">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${ACCENTS[i % 4].soft} ${ACCENTS[i % 4].fg}`}>
            <Icon name={t.icon} className="h-5 w-5" />
          </span>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t.label}</p>
          <p className="mt-1 font-semibold leading-snug text-ink">{t.value}</p>
          {t.note && <p className="mt-0.5 text-sm leading-snug text-muted">{t.note}</p>}
        </div>
      ))}
    </section>
  )
}

// ---- booking card: beside the content on computers, near the top on phones ----

function reassurance(w: Workshop): string[] {
  if (w.interest_only) return ['Nothing to pay now', 'First to hear when details are fixed', 'Places offered in order of registration']
  const included = w.provided.length ? ['Tools, materials and safety gear included'] : []
  if (!w.fee_inr) return ['Confirmed instantly', ...included, 'Help arranging a stay at Kanha']
  return [`Reserve now, pay within ${w.hold_hours_effective} hours`, 'Pay by UPI from any app', ...included, 'Help arranging a stay at Kanha']
}

function BookingCard({ w, onRegister, variant }: { w: Workshop; onRegister: () => void; variant: 'inline' | 'side' }) {
  const cta = callToAction(w)
  const days = dayCount(w)
  return (
    <div
      id={variant === 'inline' ? 'booking' : undefined}
      className={`relative overflow-hidden rounded-3xl bg-white p-6 pt-7 shadow-[0_24px_60px_-34px_rgb(43_38_32/0.7)] ring-1 ring-ink/8 ${variant === 'inline' ? 'lg:hidden' : ''}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,var(--color-terracotta),var(--color-ochre),var(--color-sage))]" />
      {w.fee_tba ? (
        <p className="font-display text-[1.7rem] leading-tight text-ink">Fee to be announced</p>
      ) : (
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-[2.3rem] leading-none text-ink">{feeLabel(w)}</span>
          {w.fee_inr > 0 && <span className="text-sm text-muted">per person{days ? ` · ${days} ${days === 1 ? 'day' : 'days'}` : ''}</span>}
        </p>
      )}

      <dl className="mt-5 space-y-2 border-t border-ink/8 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Dates</dt>
          <dd className="text-right font-medium text-ink">{dateRange(w.starts_on, w.ends_on)}</dd>
        </div>
        {timings(w.daily_start, w.daily_end) && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Timings</dt>
            <dd className="text-right font-medium text-ink">{timings(w.daily_start, w.daily_end)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Venue</dt>
          <dd className="text-right font-medium text-ink">{w.venue}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onRegister}
        disabled={!w.registration_open}
        className={`${PRIMARY} mt-6 h-14 w-full text-base shadow-[0_12px_24px_-12px_rgb(159_87_56/0.8)]`}
      >
        {cta.label}
      </button>
      {w.registration_open ? (
        <ul className="mt-5 space-y-2.5">
          {reassurance(w).map((r) => (
            <li key={r} className="flex items-start gap-2.5 text-sm text-ink">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
              {r}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{cta.note}</p>
      )}
    </div>
  )
}

/** Phones: once the in-page booking card scrolls away, a slim bar keeps booking one tap away. */
function MobileBar({ w, onRegister }: { w: Workshop; onRegister: () => void }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const card = document.getElementById('booking')
    if (!card) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(card)
    return () => io.disconnect()
  }, [])
  if (!w.registration_open) return null
  const cta = callToAction(w)
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgb(0_0_0/0.45)] backdrop-blur transition-transform duration-300 ease-soft lg:hidden ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0 text-sm">
          <p className="truncate font-semibold text-ink">{feeLabel(w)}</p>
          <p className="truncate text-muted">{w.interest_only ? 'Nothing to pay now' : dateRange(w.starts_on, w.ends_on)}</p>
        </div>
        <button type="button" onClick={onRegister} tabIndex={show ? 0 : -1} className={`${PRIMARY} h-12 shrink-0 px-6`}>
          {cta.label}
        </button>
      </div>
    </div>
  )
}

// ---- story ----

function SectionTitle({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-muted">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-display text-[clamp(1.9rem,1.6vw+1.3rem,2.6rem)] leading-[1.12] text-ink">
        {title}
      </h2>
      {children && <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{children}</p>}
    </div>
  )
}

function HowItWorks({ w }: { w: Workshop }) {
  const steps = bookingSteps(w)
  return (
    <section aria-labelledby="how">
      <SectionTitle id="how" eyebrow="Booking" title="How it works" />
      <ol className="relative mt-7 grid gap-5 md:grid-cols-3">
        {/* the thread joining the steps */}
        <span aria-hidden="true" className="absolute bottom-6 left-[1.35rem] top-6 w-px bg-ink/15 md:bottom-auto md:left-6 md:right-6 md:top-[1.35rem] md:h-px md:w-auto" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 md:block">
            <span className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg text-white ring-4 ring-paper ${[ACCENTS[0].bg, ACCENTS[1].bg, ACCENTS[2].bg][i % 3]}`}>
              {i + 1}
            </span>
            <div className="md:mt-4">
              <p className="font-semibold text-ink">{s.title}</p>
              <p className="mt-1 text-[0.9375rem] leading-snug text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function About({ w }: { w: Workshop }) {
  if (!w.summary && !w.outcomes.length) return null
  return (
    <section aria-labelledby="about">
      <SectionTitle id="about" eyebrow="About" title="Why take part" />
      {w.summary && <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-muted md:text-lg">{w.summary}</p>}
      {w.outcomes.length > 0 && (
        <>
          <h3 className="mt-10 font-display text-[1.45rem] text-ink">By the end, you will be able to</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {w.outcomes.map((o) => (
              <li key={o} className="flex gap-3 rounded-2xl bg-white/55 p-4 ring-1 ring-ink/6">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                <span className="leading-relaxed text-ink">{o}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function TakeHome({ w }: { w: Workshop }) {
  const outputs = w.schedule.flatMap((d) => d.outputs)
  if (!outputs.length) return null
  return (
    <section aria-labelledby="take-home" className="relative isolate -mx-6 overflow-hidden px-6 py-10 text-paper sm:mx-0 sm:rounded-3xl sm:px-8 md:px-10 md:py-12">
      <img src={PHOTOS.layingBlock.src} srcSet={PHOTOS.layingBlock.srcSet} sizes="(min-width: 1024px) 760px, 100vw" alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[40%_60%]" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgb(34_37_27/0.94),rgb(34_37_27/0.86)_45%,rgb(92_52_30/0.82))]" />
      <p className="eyebrow text-clay">Not just theory</p>
      <h2 id="take-home" className="mt-3 font-display text-[clamp(1.9rem,1.6vw+1.3rem,2.6rem)] leading-[1.12]">
        What you'll make with your own hands
      </h2>
      <ul className="mt-7 grid gap-3 sm:grid-cols-2">
        {outputs.map((o) => (
          <li key={o} className="flex items-start gap-3 rounded-2xl bg-paper/[0.08] p-4 ring-1 ring-paper/15 backdrop-blur-[2px]">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper/15 text-paper">
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
            <span className="leading-snug text-paper/90">{o}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Schedule({ w }: { w: Workshop }) {
  const [active, setActive] = useState(0)
  const d = w.schedule[active]
  const tabs = w.schedule.length > 1
  const label = (i: number) => w.schedule[i].label || `Day ${i + 1}`
  return (
    <section aria-labelledby="schedule">
      <SectionTitle id="schedule" eyebrow="The programme" title="What you will do" />
      {tabs && (
        <div role="tablist" aria-label="Schedule" className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1">
          {w.schedule.map((day, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              id={`tab-${i}`}
              aria-selected={active === i}
              aria-controls="schedule-panel"
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-left transition-colors duration-300 ${
                active === i ? 'bg-moss text-paper' : 'bg-white/60 text-ink ring-1 ring-ink/10 hover:bg-white'
              }`}
            >
              <span className={`block text-xs font-semibold uppercase tracking-[0.14em] ${active === i ? 'text-clay' : 'text-terracotta'}`}>{label(i)}</span>
              <span className="mt-1 block text-sm font-medium">{day.title}</span>
            </button>
          ))}
        </div>
      )}
      <div id="schedule-panel" role={tabs ? 'tabpanel' : undefined} aria-labelledby={tabs ? `tab-${active}` : undefined} className="mt-6">
        {!tabs && <h3 className="mb-4 font-display text-[1.45rem] text-ink">{d.title}</h3>}
        <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[1.05rem] before:top-4 before:w-px before:bg-ink/12">
          {d.sessions.map((s, j) => (
            <li key={`${active}-${j}`} className="relative flex gap-4">
              <span className="relative z-10 mt-4 flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-full bg-paper text-xs font-semibold text-terracotta ring-1 ring-terracotta/40">
                {j + 1}
              </span>
              <div className="flex min-w-0 flex-1 gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-ink/6">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold leading-snug text-ink">{s.title}</h4>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{s.content}</p>
                  {s.method && <p className={`mt-2.5 inline-block rounded-full px-3 py-1 text-xs text-ink/80 ${ACCENTS[(j + 1) % 4].soft}`}>{s.method}</p>}
                </div>
                {sessionPhoto(s.title) && (
                  <img
                    src={sessionPhoto(s.title)!.src}
                    srcSet={sessionPhoto(s.title)!.srcSet}
                    sizes="112px"
                    alt=""
                    loading="lazy"
                    style={{ objectPosition: sessionPhoto(s.title)!.focus }}
                    className="hidden h-24 w-28 shrink-0 rounded-xl object-cover sm:block"
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function TrainerCard({ t, index }: { t: Trainer; index: number }) {
  const [more, setMore] = useState(false)
  const long = t.bio.length > 220
  return (
    <article className="flex flex-col rounded-2xl bg-white/65 p-6 ring-1 ring-ink/8">
      <div className="flex items-center gap-4">
        <Portrait trainer={t} index={index} className="h-[4.5rem] w-[4.5rem] shrink-0 text-xl" />
        <div className="min-w-0">
          <h3 className="font-display text-[1.4rem] leading-tight text-ink">{t.name}</h3>
          {t.title && <p className="mt-1 text-sm font-semibold leading-snug text-terracotta">{t.title}</p>}
        </div>
      </div>
      {t.experience && (
        <p className="mt-4 flex items-start gap-2 text-sm font-medium text-ink">
          <Icon name="hourglass" className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          {t.experience}
        </p>
      )}
      {t.bio && (
        <div className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          <p className={`whitespace-pre-line ${long && !more ? 'line-clamp-4' : ''}`}>{t.bio}</p>
          {long && (
            <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="mt-2 text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
              {more ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
      {t.expertise.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {t.expertise.slice(0, more ? undefined : 4).map((e) => (
            <li key={e} className="rounded-full bg-tan/70 px-2.5 py-1 text-xs text-ink/80">{e}</li>
          ))}
          {!more && t.expertise.length > 4 && <li className="rounded-full px-2.5 py-1 text-xs text-muted">+{t.expertise.length - 4} more</li>}
        </ul>
      )}
    </article>
  )
}

function Trainers({ trainers }: { trainers: Trainer[] }) {
  return (
    <section aria-labelledby="trainers">
      <SectionTitle id="trainers" eyebrow={trainers.length > 1 ? `Your ${trainers.length} trainers` : 'Your trainer'} title="Learn from people who build">
        Practitioners who design and build with earth, and teach each technique by doing it alongside you.
      </SectionTitle>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {trainers.map((t, i) => (
          <TrainerCard key={t.id} t={t} index={i} />
        ))}
      </div>
    </section>
  )
}

function Practical({ w }: { w: Workshop }) {
  return (
    <section aria-label="Practical details" className="grid gap-5 md:grid-cols-2">
      {w.provided.length > 0 && (
        <div className="rounded-2xl bg-ochre-soft p-6">
          <Icon name="tools" className="h-6 w-6 text-ochre" />
          <h3 className="mt-3 font-display text-xl text-ink">Provided for you</h3>
          <ul className="mt-3 space-y-1.5 text-[0.9375rem] text-muted">
            {w.provided.map((p) => (
              <li key={p} className="flex gap-2">
                <Icon name="check" className="mt-1 h-3.5 w-3.5 shrink-0 text-ochre" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-2xl bg-sky-soft p-6">
        <Icon name="bed" className="h-6 w-6 text-sky" />
        <h3 className="mt-3 font-display text-xl text-ink">Stay & food</h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Coming from afar? Tick the box when you register and our team will help you arrange a stay at Kanha, and note any
          food needs.
        </p>
      </div>
      <div className="earth rounded-2xl p-6 text-paper md:col-span-2 md:p-8">
        <Icon name="shield" className="h-6 w-6" />
        <h3 className="mt-3 font-display text-2xl">Campus & safety</h3>
        <ul className="mt-3 grid gap-2 text-[0.9375rem] leading-relaxed text-paper/90 md:grid-cols-3 md:gap-5">
          <li>Kanha Shanti Vanam is a substance-free campus: no alcohol, smoking or tobacco.</li>
          <li>Open to everyone aged 18 and over.</li>
          <li>All practical work is supervised by the trainers.</li>
        </ul>
        {w.safety_note && <p className="mt-5 border-t border-paper/15 pt-5 text-sm leading-relaxed text-paper/80">{w.safety_note}</p>}
      </div>
    </section>
  )
}

function Faq({ w }: { w: Workshop }) {
  const pay: [string, string] = w.interest_only
    ? ['Why register interest now?', 'You hear first when the dates and fee are fixed, and you are invited to book before anyone else. There is nothing to pay until then.']
    : w.fee_inr
      ? ['How do I pay?', `By UPI, from any app. After you reserve, your booking page shows the QR code and the amount (${rupees(w.fee_inr)}). Pay within ${w.hold_hours_effective} hours and enter the payment reference; we confirm your place by email.`]
      : ['Is it really free?', 'Yes. Register and your place is confirmed straight away, with a calendar invite.']
  const items: [string, string][] = [
    ['Do I need any building experience?', 'No. The trainers demonstrate each technique first, and all practical work is supervised. Curiosity and comfortable clothes are enough.'],
    ['Who can join?', 'Anyone aged 18 or over: students, masons, architects and engineers, homeowners planning to build, and anyone curious about building with earth.'],
    pay,
    ['Can you help with a stay and food?', 'Yes. Tick the box in the form and our team will be in touch about arranging a stay at Kanha and any food needs.'],
    ['Can I cancel?', 'Yes, at any time from your booking page. If you have already paid, our team will contact you about your payment.'],
    ['Are there campus rules?', 'Kanha Shanti Vanam is a substance-free campus: no alcohol, smoking or tobacco anywhere on site.'],
  ]
  return (
    <section aria-labelledby="faq">
      <SectionTitle id="faq" eyebrow="Questions" title="Good to know" />
      <div className="mt-6 divide-y divide-ink/10 rounded-2xl bg-white/60 ring-1 ring-ink/8">
        {items.map(([q, a]) => (
          <details key={q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink">
              {q}
              <Icon name="plus" className="h-5 w-5 shrink-0 text-terracotta transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="-mt-1 pb-5 text-[0.9375rem] leading-relaxed text-muted">{a}</p>
          </details>
        ))}
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
        <p className="eyebrow text-clay">Heartisan Home workshops</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,2.5vw+1.2rem,3rem)] leading-tight">Ready to get your hands in the earth?</h2>
        <p className="mt-4 text-paper/80">
          {w.interest_only ? cta.note : `${dateRange(w.starts_on, w.ends_on)} · ${w.venue} · ${feeLabel(w)}`}
        </p>
        <button type="button" onClick={onRegister} className={`${PRIMARY} mt-8 h-14 px-9 text-base`}>
          {cta.label}
        </button>
      </div>
    </section>
  )
}

function Skeleton() {
  const bar = 'animate-pulse rounded-lg bg-ink/[0.07]'
  return (
    <div className="paper pb-20" role="status" aria-label="Loading the workshop">
      <div className="container-site pt-12">
        <div className={`${bar} h-4 w-28`} />
        <div className={`${bar} mt-6 h-12 w-3/4`} />
        <div className={`${bar} mt-3 h-12 w-1/2`} />
        <div className={`${bar} mt-6 h-5 w-80 max-w-full`} />
        <div className={`${bar} mt-8 aspect-[21/9] w-full rounded-2xl`} />
      </div>
    </div>
  )
}
