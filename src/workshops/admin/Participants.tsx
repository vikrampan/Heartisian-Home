import { useMemo, useState, type ReactNode } from 'react'
import { paymentCode } from '../helpers'
import { BACKGROUNDS, EXPERIENCE, dateRange, feeLabel, moment, rupees, useLoad, type ApiError, type Registration } from '../lib'
import { Spinner } from '../ui'
import { Badge, Busy, Card, Drawer, FillBar, Link, Note, TextArea } from './kit'
import { type AdminWorkshop, ago, BTN_DANGER, BTN_DARK, BTN_PLAIN, BTN_PRIMARY, REG_STATUS, regLabel } from './util'
import { admin } from './session'

type Filter = 'all' | 'interested' | 'confirmed' | 'verifying' | 'held' | 'waitlisted' | 'ended' | 'stay'

const FILTERS: [Filter, string][] = [
  ['all', 'Everyone'],
  ['interested', 'Interested'],
  ['confirmed', 'Confirmed'],
  ['verifying', 'Payment to check'],
  ['held', 'Awaiting payment'],
  ['waitlisted', 'Waitlist'],
  ['ended', 'Cancelled or ended'],
  ['stay', 'Need a stay'],
]

const matches = (r: Registration, f: Filter) =>
  f === 'all' ||
  (f === 'ended' ? r.status === 'cancelled' || r.status === 'expired' : f === 'stay' ? r.needs_stay && !['cancelled', 'expired'].includes(r.status) : r.status === f)

const background = (r: Registration) => (r.background === 'other' && r.background_other ? r.background_other : (BACKGROUNDS[r.background] ?? r.background))

export default function Participants({ workshopId }: { workshopId: string }) {
  const { data, error, loading, reload } = useLoad(`regs:${workshopId}`, () =>
    admin<{ workshop: AdminWorkshop; registrations: Registration[] }>('registrations', { workshop_id: workshopId }),
  )
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(() => new URLSearchParams(window.location.search).get('open'))

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data?.registrations ?? [])
      .filter((r) => matches(r, filter))
      .filter((r) => !q || [r.name, r.email, r.phone, r.city, r.payment_reference ?? '', paymentCode(r.token)].some((v) => v.toLowerCase().includes(q)))
  }, [data, filter, query])

  if (loading) return <Busy />
  if (error || !data) return <Note>{error?.message}</Note>
  const w = data.workshop

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/workshops" className="text-sm font-semibold text-terracotta hover:underline">All workshops</Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[1.9rem] leading-tight text-ink">{w.title}</h1>
            <p className="mt-1 text-sm text-muted">
              {dateRange(w.starts_on, w.ends_on)} · {feeLabel(w)} · {w.checked_in} checked in
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => downloadCsv(w, data.registrations)} className={BTN_DARK}>Download CSV</button>
            <Link href={`/admin/workshops/${w.id}`} className={BTN_PLAIN}>Edit workshop</Link>
          </div>
        </div>
        <div className="mt-4 max-w-xl"><FillBar w={w} /></div>
        <OfferAll w={w} waiting={data.registrations.filter((r) => r.status === 'interested' || r.status === 'waitlisted').length} onDone={reload} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
            {FILTERS.map(([key, label]) => {
              const n = data.registrations.filter((r) => matches(r, key)).length
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-sm ${filter === key ? 'bg-moss text-paper' : 'bg-ink/5 text-ink hover:bg-ink/10'}`}
                >
                  {label} <span className="opacity-70">{n}</span>
                </button>
              )
            })}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, reference"
            aria-label="Search participants"
            className="h-10 w-full rounded-lg border border-ink/15 bg-white px-3 text-[0.9375rem] outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 lg:w-72"
          />
        </div>

        {rows.length === 0 ? (
          <p className="py-10 text-center text-muted">{data.registrations.length ? 'Nobody matches.' : 'No registrations yet.'}</p>
        ) : (
          <>
          {/* phones: one card per person */}
          <ul className="mt-4 divide-y divide-ink/8 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setOpenId(r.id)} className="flex w-full items-start justify-between gap-3 py-3 text-left">
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">
                      {r.name}
                      {r.checked_in_at && <span className="ml-1.5 text-xs font-normal text-[#46542a]">✓ here</span>}
                    </span>
                    <span className="block truncate text-xs text-muted">{r.email}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {r.phone} · {r.city} · {ago(r.created_at)}
                    </span>
                  </span>
                  <Badge label={r.status === 'waitlisted' ? `Waitlist #${r.waitlist_position}` : regLabel(r)} tone={REG_STATUS[r.status][1]} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">Phone</th>
                  <th className="py-2 pr-3 font-semibold">From</th>
                  <th className="py-2 pr-3 font-semibold">Background</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-paper/70" onClick={() => setOpenId(r.id)}>
                    <td className="py-2.5 pr-3">
                      <button type="button" onClick={() => setOpenId(r.id)} className="text-left font-semibold text-ink hover:underline">
                        {r.name}
                        {r.checked_in_at && <span className="ml-1.5 text-xs font-normal text-[#46542a]">✓ here</span>}
                      </button>
                      <span className="block text-xs text-muted">{r.email}</span>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{r.phone}</td>
                    <td className="py-2.5 pr-3">{r.city}</td>
                    <td className="py-2.5 pr-3">{background(r)}</td>
                    <td className="py-2.5 pr-3">
                      <Badge label={r.status === 'waitlisted' ? `Waitlist #${r.waitlist_position}` : regLabel(r)} tone={REG_STATUS[r.status][1]} />
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-muted">{ago(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>

      {openId && <Detail id={openId} seatsLeft={w.seats_left} ready={!w.interest_only} onClose={() => setOpenId(null)} onChange={reload} />}
    </div>
  )
}

interface DetailData {
  registration: Registration
  events: { id: number; at: string; actor: string; kind: string; from_status: string | null; to_status: string | null; detail: string | null }[]
  emails: { id: number; created_at: string; template: string; subject: string; ok: boolean; error: string | null; to_email: string }[]
}

const EVENT_WORDS: Record<string, string> = {
  registered: 'Registered',
  interested: 'Registered interest',
  payment_submitted: 'Sent a payment reference',
  accepted_place: 'Accepted the offered place',
  cancelled: 'Cancelled',
  hold_expired: 'Hold ended (not paid in time)',
  confirm: 'Confirmed',
  reject_payment: 'Payment not matched',
  cancel: 'Cancelled by the team',
  offer_place: 'Offered a place',
  check_in: 'Checked in',
  undo_check_in: 'Check-in undone',
  note: 'Note updated',
  workshop_cancelled: 'Workshop cancelled',
}

function Detail({ id, seatsLeft, ready, onClose, onChange }: { id: string; seatsLeft: number; ready: boolean; onClose: () => void; onChange: () => void }) {
  const { data, error, loading, set } = useLoad(`reg:${id}`, () => admin<DetailData>('registration', { id }))
  const [busy, setBusy] = useState('')
  const [problem, setProblem] = useState('')
  const [reason, setReason] = useState<{ act: 'cancel' | 'reject_payment'; text: string } | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function act(act: string, extra: object = {}) {
    setBusy(act)
    setProblem('')
    try {
      set(await admin<DetailData>(act === 'resend_email' ? 'resend_email' : 'registration_action', { id, act, ...extra }))
      setReason(null)
      onChange()
    } catch (e) {
      setProblem((e as ApiError).message)
    } finally {
      setBusy('')
    }
  }

  const r = data?.registration
  const paid = (r?.amount_inr ?? 0) > 0
  const button = (label: string, a: string, cls = BTN_PLAIN, extra: object = {}) => (
    <button type="button" disabled={!!busy} onClick={() => act(a, extra)} className={cls}>
      {busy === a && <Spinner className="h-4 w-4" />} {label}
    </button>
  )

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        r ? (
          <>
            <p className="font-display text-[1.45rem] leading-tight text-ink">{r.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge label={r.status === 'waitlisted' ? `Waitlist #${r.waitlist_position}` : regLabel(r)} tone={REG_STATUS[r.status][1]} />
              {r.checked_in_at && <Badge label="Checked in" tone="bg-[#e1e6cc] text-[#46542a]" />}
              <span className="text-xs text-muted">Registered {moment(r.created_at)}</span>
            </div>
          </>
        ) : (
          'Participant'
        )
      }
    >
      {loading && <Busy />}
      {error && <Note>{error.message}</Note>}
      {r && data && (
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-4 ring-1 ring-ink/8">
            <p className="text-sm font-semibold text-ink">Actions</p>
            {r.status === 'verifying' && (
              <p className="mt-1 text-sm text-muted">
                They paid with reference <strong className="text-ink">{r.payment_reference}</strong> (note {paymentCode(r.token)}). Check it in your UPI account.
              </p>
            )}
            {r.status === 'held' && paid && <p className="mt-1 text-sm text-muted">Place held until {moment(r.hold_until)}. Payment note to look for: {paymentCode(r.token)}.</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status === 'verifying' && button('Confirm payment', 'confirm', BTN_PRIMARY)}
              {r.status === 'verifying' && (
                <button type="button" onClick={() => setReason({ act: 'reject_payment', text: 'No payment with this reference has arrived.' })} className={BTN_PLAIN}>
                  Payment not found
                </button>
              )}
              {r.status === 'held' && button(paid ? 'Confirm (payment received)' : 'Confirm place', 'confirm', BTN_PRIMARY)}
              {(r.status === 'waitlisted' || r.status === 'interested') && ready && seatsLeft > 0 && button('Offer a place', 'offer_place', BTN_PRIMARY)}
              {['cancelled', 'expired'].includes(r.status) && ready && seatsLeft > 0 && button('Offer the place again', 'offer_place', BTN_PRIMARY)}
              {['waitlisted', 'interested', 'cancelled', 'expired'].includes(r.status) && ready && seatsLeft > 0 && button('Confirm directly', 'confirm')}
              {r.status === 'confirmed' && !r.checked_in_at && button('Check in', 'check_in', BTN_PRIMARY)}
              {r.status === 'confirmed' && r.checked_in_at && button('Undo check-in', 'undo_check_in')}
              {['held', 'verifying', 'confirmed', 'waitlisted', 'interested'].includes(r.status) && (
                <button type="button" onClick={() => setReason({ act: 'cancel', text: '' })} className={BTN_DANGER}>
                  Cancel registration
                </button>
              )}
              {button('Resend latest email', 'resend_email')}
            </div>
            {r.status === 'waitlisted' && seatsLeft === 0 && <p className="mt-2 text-xs text-muted">No place is free right now. When one frees up, you can offer it here.</p>}
            {r.status === 'interested' && !ready && <p className="mt-2 text-xs text-muted">Once the workshop's dates and fee are set, offer places from here, or to everyone at once from the top of this page.</p>}
            {reason && (
              <div className="mt-4 space-y-2 rounded-lg bg-paper/70 p-3">
                <label className="block text-sm font-semibold text-ink" htmlFor="reason">
                  {reason.act === 'cancel' ? 'Reason (included in the email to them, optional)' : 'What to tell them (included in the email)'}
                </label>
                <TextArea id="reason" value={reason.text} onChange={(e) => setReason({ ...reason, text: e.target.value })} />
                <div className="flex gap-2">
                  {button(reason.act === 'cancel' ? 'Cancel and email them' : 'Send back to pay again', reason.act, reason.act === 'cancel' ? BTN_DANGER : BTN_PRIMARY, { note: reason.text })}
                  <button type="button" onClick={() => setReason(null)} className={BTN_PLAIN}>Keep as it is</button>
                </div>
              </div>
            )}
            {problem && <div className="mt-3"><Note>{problem}</Note></div>}
            <p className="mt-3 text-xs text-muted">Each change emails them automatically, except check-in and notes.</p>
          </section>

          <Section title="Contact">
            <Row k="Email" v={<a href={`mailto:${r.email}`} className="text-terracotta hover:underline">{r.email}</a>} />
            <Row k="Phone" v={<a href={`tel:${r.phone.replace(/\s/g, '')}`} className="text-terracotta hover:underline">{r.phone}</a>} />
            <Row k="From" v={r.city} />
            <Row k="Emergency contact" v={`${r.emergency_name} · ${r.emergency_phone}`} />
          </Section>
          <Section title="Background">
            <Row k="Describes them" v={background(r)} />
            <Row k="Experience" v={EXPERIENCE[r.experience] ?? r.experience} />
            <Row k="Organisation" v={r.organisation} />
            <Row k="Why they want to join" v={r.motivation} />
            <Row k="Heard about us" v={r.heard_from} />
          </Section>
          <Section title="Practical">
            <Row k="Stay at Kanha" v={r.needs_stay ? 'Would like help arranging a stay' : 'Not needed'} />
            <Row k="Food needs" v={r.food_needs} />
            <Row k="Photo consent" v={r.photo_consent ? 'Yes' : 'No'} />
            <Row k="Fee" v={paid ? `${rupees(r.amount_inr)}${r.payment_reference ? ` · reference ${r.payment_reference}` : ''}` : 'Free'} />
          </Section>

          <section>
            <label htmlFor="private-note" className="mb-1.5 block text-sm font-semibold text-ink">
              Private note (only the team sees this)
            </label>
            <TextArea id="private-note" value={note ?? r.admin_note ?? ''} onChange={(e) => setNote(e.target.value)} />
            {note !== null && note !== (r.admin_note ?? '') && (
              <div className="mt-2">{button('Save note', 'note', BTN_DARK, { note })}</div>
            )}
          </section>

          <Section title="History">
            <ol className="space-y-2.5">
              {data.events.map((e) => (
                <li key={e.id} className="text-sm">
                  <span className="font-semibold text-ink">{EVENT_WORDS[e.kind] ?? e.kind}</span>
                  {e.detail && e.kind !== 'note' && <span className="text-muted"> · {e.detail}</span>}
                  <span className="block text-xs text-muted">
                    {moment(e.at)} · {e.actor === 'participant' ? 'by them' : e.actor === 'system' ? 'automatic' : e.actor}
                  </span>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Emails sent">
            {data.emails.length === 0 ? (
              <p className="text-sm text-muted">None yet.</p>
            ) : (
              <ol className="space-y-2">
                {data.emails.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span className={m.ok ? 'text-ink' : 'text-[#a13a28]'}>{m.subject}</span>
                    <span className="block text-xs text-muted">
                      {moment(m.created_at)} · {m.to_email} · {m.ok ? 'sent' : `not sent: ${m.error}`}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>
      )}
    </Drawer>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      <dl className="divide-y divide-ink/6 rounded-xl bg-white px-4 ring-1 ring-ink/8">{children}</dl>
    </section>
  )
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  if (!v) return null
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-3">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="whitespace-pre-line break-words text-sm text-ink">{v}</dd>
    </div>
  )
}

function downloadCsv(w: AdminWorkshop, regs: Registration[]) {
  const head = [
    'Name', 'Email', 'Phone', 'City', 'Status', 'Waitlist position', 'Background', 'Experience', 'Organisation',
    'Why join', 'Heard about us', 'Needs a stay', 'Food needs', 'Emergency contact', 'Emergency phone',
    'Photo consent', 'Fee (INR)', 'Payment reference', 'Payment note', 'Registered', 'Confirmed', 'Checked in', 'Team note',
  ]
  const rows = regs.map((r) => [
    r.name, r.email, r.phone, r.city, regLabel(r), r.waitlist_position ?? '', background(r), EXPERIENCE[r.experience] ?? r.experience,
    r.organisation, r.motivation, r.heard_from, r.needs_stay ? 'Yes' : 'No', r.food_needs, r.emergency_name, r.emergency_phone,
    r.photo_consent ? 'Yes' : 'No', r.amount_inr, r.payment_reference ?? '', r.amount_inr ? paymentCode(r.token) : '',
    moment(r.created_at), moment(r.confirmed_at), moment(r.checked_in_at), r.admin_note ?? '',
  ])
  // quoted values; a leading =, +, - or @ is escaped so spreadsheet apps don't run it as a formula
  const cell = (v: unknown) => {
    const s = String(v ?? '')
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`
  }
  const csv = '﻿' + [head, ...rows].map((line) => line.map(cell).join(',')).join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `${w.slug}-participants.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Once the dates and fee are set: offer the free places to everyone interested or waiting, oldest first.
function OfferAll({ w, waiting, onDone }: { w: AdminWorkshop; waiting: number; onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  if (!waiting) return null
  if (w.interest_only) {
    return (
      <p className="mt-4 rounded-xl bg-clay/15 px-4 py-3 text-sm text-ink">
        <strong>{waiting}</strong> {waiting === 1 ? 'person has' : 'people have'} registered interest. Once{' '}
        {w.dates_tba ? 'the dates are set (Edit workshop)' : w.fee_tba ? 'the fee is set (Edit workshop)' : 'your UPI ID is added (Settings)'}, you can
        offer them places from here.
      </p>
    )
  }
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-clay/15 px-4 py-3">
      <p className="text-sm text-ink">
        <strong>{waiting}</strong> interested or waiting · {w.seats_left} {w.seats_left === 1 ? 'place' : 'places'} free
      </p>
      <button
        type="button"
        disabled={busy || w.seats_left === 0}
        onClick={async () => {
          if (!window.confirm(`Offer places to up to ${Math.min(waiting, w.seats_left)} people, oldest registration first? Each gets an email${w.fee_inr ? ' asking them to pay' : ' to confirm'}.`)) return
          setBusy(true)
          try {
            const { offered } = await admin<{ offered: number }>('offer_all', { workshop_id: w.id })
            setMessage({ tone: 'ok', text: `${offered} ${offered === 1 ? 'place' : 'places'} offered and emailed.` })
            onDone()
          } catch (e) {
            setMessage({ tone: 'error', text: (e as ApiError).message })
          } finally {
            setBusy(false)
          }
        }}
        className={BTN_PRIMARY}
      >
        {busy && <Spinner className="h-4 w-4" />} Offer places to everyone waiting
      </button>
      {message && <Note tone={message.tone}>{message.text}</Note>}
    </div>
  )
}

