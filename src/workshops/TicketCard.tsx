import { availability, dateParts, startsIn } from './helpers'
import { feeLabel, onLinkClick, timings, trainerNames, type Workshop } from './lib'
import { coverFor } from './photos'
import { Icon, Portrait, PRIMARY } from './ui'

export default function TicketCard({ w }: { w: Workshop }) {
  const url = `/workshops/${w.slug}`
  const photo = coverFor(w)
  const date = dateParts(w.starts_on, w.ends_on)
  const status = availability(w)

  return (
    <article className="relative grid overflow-hidden rounded-2xl bg-[#fbf7f0] shadow-[0_22px_50px_-30px_rgb(43_38_32/0.6)] ring-1 ring-ink/5 md:grid-cols-[14rem_1fr]">
      {/* the stub, torn off along the perforation */}
      <div className="relative isolate flex min-h-[9.5rem] items-end justify-between gap-4 overflow-hidden bg-moss px-6 py-5 text-paper md:min-h-0 md:flex-col md:items-start md:justify-between md:px-7 md:py-8">
        <img src={photo.src} srcSet={photo.srcSet || undefined} sizes="(min-width: 768px) 224px, 100vw" alt="" loading="lazy" style={{ objectPosition: photo.focus }} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(34_37_27/0.35),rgb(34_37_27/0.88)_70%)] md:bg-[linear-gradient(180deg,rgb(34_37_27/0.82),rgb(34_37_27/0.3)_45%,rgb(34_37_27/0.88))]" />
        <div>
          <p className="eyebrow text-clay">{date.month}</p>
          <p className="mt-1 font-display text-[2.6rem] leading-none md:text-[3.4rem]">{date.days}</p>
          <p className="mt-1.5 text-sm text-paper/75">{date.weekdays}</p>
        </div>
        <div className="text-right md:text-left">
          {w.fee_tba ? (
            <p className="text-sm leading-snug text-paper/85">
              Fee to be
              <br />
              announced
            </p>
          ) : (
            <>
              <p className="font-display text-2xl leading-none md:text-[1.75rem]">{feeLabel(w)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-paper/65">{w.fee_inr ? 'per person' : 'to attend'}</p>
            </>
          )}
        </div>
        {/* notches cut by the perforation */}
        <span aria-hidden="true" className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-paper md:-right-3 md:-top-3 md:bottom-auto md:left-auto" />
        <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-paper" />
      </div>

      <div className="border-t-2 border-dashed border-ink/12 p-6 md:border-l-2 md:border-t-0 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>
          {w.level && <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-muted">{w.level}</span>}
          {startsIn(w) && <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-muted">{startsIn(w)}</span>}
        </div>
        <h2 className="mt-4 font-display text-[1.6rem] leading-[1.2] text-ink md:text-[1.9rem]">
          <a href={url} onClick={onLinkClick} className="decoration-terracotta/40 underline-offset-4 hover:underline">
            {w.title}
          </a>
        </h2>
        {w.subtitle && <p className="quote mt-2 text-[1.15rem] leading-snug text-ink/75">{w.subtitle}</p>}

        <ul className="mt-5 grid gap-2.5 text-[0.9375rem] text-muted sm:grid-cols-2">
          <li className="flex items-center gap-2.5">
            <Icon name="pin" className="h-[1.15rem] w-[1.15rem] shrink-0 text-terracotta" />
            {w.venue}
          </li>
          {timings(w.daily_start, w.daily_end) && (
            <li className="flex items-center gap-2.5">
              <Icon name="clock" className="h-[1.15rem] w-[1.15rem] shrink-0 text-terracotta" />
              {timings(w.daily_start, w.daily_end)}
            </li>
          )}
          {w.format && (
            <li className="flex items-center gap-2.5 sm:col-span-2">
              <Icon name="tools" className="h-[1.15rem] w-[1.15rem] shrink-0 text-terracotta" />
              {w.format}
            </li>
          )}
        </ul>

        {w.trainers.length > 0 && (
          <div className="mt-5 flex items-center gap-3">
            <span className="flex -space-x-1.5">
              {w.trainers.map((t, i) => (
                <Portrait key={t.id} trainer={t} index={i} className="h-10 w-10 text-sm ring-2 ring-[#fbf7f0]" />
              ))}
            </span>
            <span className="text-sm text-muted">with {trainerNames(w.trainers.map((t) => t.name))}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-5 border-t border-ink/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="check" className="h-4 w-4 shrink-0 text-sage" />
            {w.interest_only ? 'Register now, pay nothing yet' : w.fee_inr ? `Reserve now, pay within ${w.hold_hours_effective} hours` : 'Free · confirmed instantly'}
          </p>
          <a href={url} onClick={onLinkClick} className={`${PRIMARY} h-12 shrink-0 px-6 text-[0.9375rem]`}>
            {!w.registration_open ? 'View details' : w.interest_only ? 'Details & register interest' : 'Details & registration'}
          </a>
        </div>
      </div>
    </article>
  )
}

export function NoWorkshops() {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-white/40 px-6 py-14 text-center">
      <Icon name="leaf" className="mx-auto h-8 w-8 text-terracotta" />
      <p className="mt-4 font-display text-2xl text-ink">New dates are on their way</p>
      <p className="mx-auto mt-2 max-w-md text-muted">
        The next workshops are being planned. Please check back soon, or watch our story in the meantime.
      </p>
      <a href="/#story" className="mt-6 inline-block text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
        Watch our story
      </a>
    </div>
  )
}
