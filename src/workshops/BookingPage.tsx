import { useEffect, useState, type FormEvent } from 'react'
import {
  ApiError,
  api,
  dateRange,
  firstName,
  isTouch,
  moment,
  onLinkClick,
  place,
  post,
  rupees,
  timings,
  useLoad,
  useTitle,
  type BookingView,
  type Registration,
} from './lib'
import { paymentCode } from './helpers'
import { Icon, Loading, Page, PRIMARY, Problem, SECONDARY, Spinner } from './ui'

// Each person's private page, reached from the link in their emails. It shows where their registration stands and
// what to do next: pay by UPI, confirm an offered place, add the dates to a calendar, or cancel.

export default function BookingPage({ token, fresh }: { token: string; fresh: boolean }) {
  const { data, error, loading, set } = useLoad(`b:${token}`, () => api<BookingView>(`booking?token=${encodeURIComponent(token)}`))
  useTitle('Your booking — Heartisan Home')

  if (loading) return <Page><Loading label="Opening your booking" /></Page>
  if (error || !data) {
    return (
      <Page>
        <Problem title={error?.status === 404 ? 'We could not find this booking' : 'Your booking did not load'}>
          <p>{error?.status === 404 ? 'Please use the link in your email. If it still does not work, reply to that email and we will help.' : error?.message}</p>
        </Problem>
      </Page>
    )
  }

  const act = async (action: 'pay' | 'accept' | 'cancel', reference?: string) => set(await post<BookingView>('booking', { token, action, reference }))

  return (
    <Page>
      <section className="paper min-h-[70vh] pb-20 pt-10 md:pt-14">
        <div className="container-site max-w-4xl">
          <Status view={data} fresh={fresh} />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-6">
              {data.registration.status === 'held' && data.registration.amount_inr > 0 && <Pay view={data} act={act} />}
              {data.registration.status === 'held' && data.registration.amount_inr === 0 && <Accept view={data} act={act} />}
              {data.registration.status === 'confirmed' && <Calendar view={data} token={token} />}
              <Details r={data.registration} />
            </div>
            <aside className="space-y-6">
              <Help view={data} />
              {['held', 'verifying', 'confirmed', 'waitlisted'].includes(data.registration.status) && <Cancel r={data.registration} act={act} />}
            </aside>
          </div>
        </div>
      </section>
    </Page>
  )
}

function statusCopy(r: Registration) {
  const paid = r.amount_inr > 0
  switch (r.status) {
    case 'confirmed':
      return { stamp: 'Confirmed', tone: 'text-[#4d5a2e] border-[#4d5a2e]', heading: `You're in, ${firstName(r.name)}`, text: 'Your place is confirmed. We will email you a reminder with the practical details two days before.' }
    case 'held':
      return paid
        ? { stamp: 'Place held', tone: 'text-terracotta border-terracotta', heading: 'Pay to confirm your place', text: `Your place is held until ${moment(r.hold_until)}. Pay by UPI below, then send us the payment reference.` }
        : { stamp: 'Place offered', tone: 'text-terracotta border-terracotta', heading: 'A place is waiting for you', text: `Please confirm it by ${moment(r.hold_until)}, or it goes to the next person waiting.` }
    case 'verifying':
      return { stamp: 'Checking', tone: 'text-coast border-coast', heading: "We're checking your payment", text: `Thank you. We have your payment reference ${r.payment_reference ?? ''}, and will confirm your place by email once it is matched, usually within a day.` }
    case 'waitlisted':
      return { stamp: `Waitlist #${r.waitlist_position ?? ''}`, tone: 'text-coast border-coast', heading: "You're on the waitlist", text: 'The workshop is full right now. If a place opens up, we will email you straight away.' }
    case 'cancelled':
      return { stamp: 'Cancelled', tone: 'text-muted border-muted', heading: 'This registration is cancelled', text: r.cancel_reason ?? '' }
    case 'expired':
      return { stamp: 'Hold ended', tone: 'text-muted border-muted', heading: 'Your hold has ended', text: 'We did not receive a payment reference in time, so the place was released. If you did pay, reply to our email with your payment reference and we will sort it out.' }
  }
}

function Status({ view, fresh }: { view: BookingView; fresh: boolean }) {
  const r = view.registration
  const s = statusCopy(r)
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
      {/* an ink stamp */}
      <div
        aria-hidden="true"
        className={`flex h-32 w-32 shrink-0 -rotate-[8deg] items-center justify-center rounded-full border-[3px] border-double p-2 text-center ${s.tone}`}
      >
        <span className="flex h-full w-full items-center justify-center rounded-full border border-current px-2 text-[0.8rem] font-bold uppercase leading-tight tracking-[0.14em]">
          {s.stamp}
        </span>
      </div>
      <div>
        {fresh && <p className="script text-[1.75rem] leading-none text-terracotta">Thank you for registering!</p>}
        <p className="eyebrow mt-3 text-muted">Your booking</p>
        <h1 className="mt-2 font-display text-[clamp(2.1rem,2.5vw+1.2rem,3.2rem)] leading-[1.1] text-ink">{s.heading}</h1>
        {s.text && <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-muted">{s.text}</p>}
        <p className="mt-3 text-sm text-muted">We have also emailed this to {r.email}.</p>
      </div>
    </div>
  )
}

function useCountdown(until: string | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])
  if (!until) return ''
  const mins = Math.max(0, Math.round((Date.parse(until) - now) / 60_000))
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d) return `${d} ${d === 1 ? 'day' : 'days'} ${h} ${h === 1 ? 'hour' : 'hours'} left`
  if (h) return `${h} ${h === 1 ? 'hour' : 'hours'} ${m} min left`
  return `${m} min left`
}

function Pay({ view, act }: { view: BookingView; act: (a: 'pay', ref: string) => Promise<void> }) {
  const r = view.registration
  const code = paymentCode(r.token)
  // spaces as %20 and a plain @: what UPI apps expect (some show "+" literally)
  const enc = (v: string) => encodeURIComponent(v).replace(/%40/g, '@')
  const upi = `upi://pay?pa=${enc(view.payment.upi_id)}&pn=${enc(view.payment.payee_name)}&am=${r.amount_inr.toFixed(2)}&cu=INR&tn=${enc(code)}`
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const left = useCountdown(r.hold_until)

  useEffect(() => {
    let live = true
    import('qrcode')
      .then((QR) => QR.toDataURL(upi, { margin: 1, width: 480, errorCorrectionLevel: 'M', color: { dark: '#2b2620', light: '#ffffff' } }))
      .then((url) => live && setQr(url))
    return () => {
      live = false
    }
  }, [upi])

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setProblem('')
    try {
      await act('pay', reference)
    } catch (err) {
      setProblem((err as ApiError).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white/70 ring-1 ring-ink/8">
      <div className="flex items-center justify-between gap-4 bg-moss px-5 py-4 text-paper sm:px-7">
        <p className="font-display text-xl">1. Pay {rupees(r.amount_inr)} by UPI</p>
        <p className="shrink-0 rounded-full bg-paper/12 px-3 py-1 text-xs font-semibold">{left}</p>
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-[13rem_1fr] sm:p-7">
        <div className="mx-auto w-full max-w-[13rem]">
          <div className="aspect-square rounded-xl bg-white p-2 ring-1 ring-ink/10">
            {qr ? <img src={qr} alt={`UPI QR code to pay ${rupees(r.amount_inr)} to ${view.payment.payee_name}`} className="h-full w-full" /> : <div className="flex h-full items-center justify-center text-muted"><Spinner /></div>}
          </div>
          <p className="mt-2 text-center text-xs text-muted">Scan with any UPI app</p>
        </div>
        <div className="space-y-4">
          {isTouch() && (
            <a href={upi} className={`${PRIMARY} h-12 w-full px-6`}>
              <Icon name="phone" className="h-5 w-5" />
              Pay in my UPI app
            </a>
          )}
          <dl className="space-y-3 text-[0.9375rem]">
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-muted">UPI ID</dt>
              <dd className="mt-0.5 flex items-center gap-2 font-semibold text-ink">
                <span className="break-all">{view.payment.upi_id}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(view.payment.upi_id).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    })
                  }}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-terracotta hover:bg-terracotta/10"
                >
                  <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-muted">Name</dt>
              <dd className="mt-0.5 font-semibold text-ink">{view.payment.payee_name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-muted">Amount</dt>
              <dd className="mt-0.5 font-semibold text-ink">{rupees(r.amount_inr)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-muted">Payment note</dt>
              <dd className="mt-0.5 font-semibold text-ink">
                {code} <span className="font-normal text-muted">(filled in when you scan)</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <form onSubmit={send} className="border-t border-ink/8 bg-paper/50 p-5 sm:p-7">
        <label htmlFor="reference" className="font-display text-xl text-ink">
          2. Send us the payment reference
        </label>
        <p className="mt-1 text-sm text-muted">
          After paying, your UPI app shows a 12-digit UTR or transaction ID. Enter it here so we can match your payment.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. 4401 2233 9876"
            autoComplete="off"
            className="h-12 flex-1 rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          />
          <button type="submit" disabled={busy || reference.trim().length < 4} className={`${PRIMARY} h-12 px-6`}>
            {busy && <Spinner className="h-4 w-4" />}
            I have paid
          </button>
        </div>
        {problem && <p role="alert" className="mt-3 text-sm text-terracotta">{problem}</p>}
      </form>
    </div>
  )
}

function Accept({ view, act }: { view: BookingView; act: (a: 'accept') => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const left = useCountdown(view.registration.hold_until)
  return (
    <div className="rounded-2xl bg-moss p-6 text-paper sm:p-8">
      <p className="eyebrow text-clay">{left}</p>
      <p className="mt-2 font-display text-2xl">Would you like this place?</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await act('accept')
          } catch (e) {
            setProblem((e as ApiError).message)
          } finally {
            setBusy(false)
          }
        }}
        className={`${PRIMARY} mt-5 h-12 px-7`}
      >
        {busy && <Spinner className="h-4 w-4" />}
        Confirm my place
      </button>
      {problem && <p role="alert" className="mt-3 text-sm text-clay">{problem}</p>}
    </div>
  )
}

function Calendar({ view, token }: { view: BookingView; token: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-moss p-6 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div>
        <p className="font-display text-xl">Add it to your calendar</p>
        <p className="mt-1 text-sm text-paper/75">{dateRange(view.registration.workshop.starts_on, view.registration.workshop.ends_on)}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <a href={`/api/booking?token=${encodeURIComponent(token)}&format=ics`} className={`${PRIMARY} h-11 px-5 text-sm`}>
          <Icon name="calendar" className="h-4 w-4" />
          Calendar file
        </a>
        {view.calendar && (
          <a href={view.calendar} target="_blank" rel="noopener noreferrer" className={`${SECONDARY} h-11 border-paper/40 px-5 text-sm text-paper hover:border-paper hover:bg-paper hover:text-ink`}>
            Google Calendar
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  )
}

function Details({ r }: { r: Registration }) {
  const w = r.workshop
  const rows: [string, string][] = [
    ['Dates', dateRange(w.starts_on, w.ends_on)],
    ['Timings', timings(w.daily_start, w.daily_end)],
    ['Venue', place(w)],
    ['Fee', r.amount_inr ? rupees(r.amount_inr) : 'Free'],
    ['Registered as', `${r.name} · ${r.email} · ${r.phone}`],
  ]
  return (
    <div className="rounded-2xl bg-white/60 p-5 ring-1 ring-ink/8 sm:p-7">
      <p className="eyebrow text-muted">The workshop</p>
      <h2 className="mt-2 font-display text-[1.55rem] leading-snug text-ink">
        <a href={`/workshops/${w.slug}`} onClick={onLinkClick} className="underline-offset-4 hover:underline">
          {w.title}
        </a>
      </h2>
      <dl className="mt-5 divide-y divide-ink/8">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[8.5rem_1fr]">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="break-words text-[0.9375rem] text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Help({ view }: { view: BookingView }) {
  return (
    <div className="rounded-2xl bg-tan/60 p-6">
      <p className="font-display text-xl text-ink">Questions?</p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
        {view.contact_email ? (
          <>
            Write to us at{' '}
            <a href={`mailto:${view.contact_email}`} className="font-semibold text-terracotta underline-offset-4 hover:underline">
              {view.contact_email}
            </a>
            , or simply reply to any of our emails.
          </>
        ) : (
          'Simply reply to any of our emails and the team will help.'
        )}
      </p>
      <p className="mt-4 text-sm text-muted">Keep this page's link private: it is your booking.</p>
    </div>
  )
}

function Cancel({ r, act }: { r: Registration; act: (a: 'cancel') => Promise<void> }) {
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const paid = r.amount_inr > 0 && (r.status === 'verifying' || r.status === 'confirmed')
  return (
    <div className="rounded-2xl p-6 ring-1 ring-ink/10">
      <p className="font-semibold text-ink">Can't come any more?</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {r.status === 'waitlisted' ? 'You can leave the waitlist at any time.' : 'Please let us know, so your place can go to someone waiting.'}
        {paid && ' Our team will contact you about your payment.'}
      </p>
      {asking ? (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await act('cancel')
              } catch (e) {
                setProblem((e as ApiError).message)
              } finally {
                setBusy(false)
                setAsking(false)
              }
            }}
            className={`${PRIMARY} h-11 px-5 text-sm`}
          >
            {busy && <Spinner className="h-4 w-4" />}
            Yes, cancel it
          </button>
          <button type="button" onClick={() => setAsking(false)} className={`${SECONDARY} h-11 px-5 text-sm`}>
            Keep my place
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAsking(true)} className="mt-4 text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
          {r.status === 'waitlisted' ? 'Leave the waitlist' : 'Cancel my registration'}
        </button>
      )}
      {problem && <p role="alert" className="mt-3 text-sm text-terracotta">{problem}</p>}
    </div>
  )
}
