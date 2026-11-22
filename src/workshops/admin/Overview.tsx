import { useState } from 'react'
import { paymentCode } from '../helpers'
import { dateRange, rupees, useLoad, type ApiError, type Registration } from '../lib'
import { Badge, Busy, Card, FillBar, Link, Note } from './kit'
import { type AdminWorkshop, ago, BTN_PLAIN, BTN_PRIMARY, REG_STATUS, regLabel, WS_STATUS } from './util'
import { admin } from './session'

type Row = Registration & { workshop_title: string }

export default function Overview() {
  const { data, error, loading, reload } = useLoad('overview', () =>
    admin<{ workshops: AdminWorkshop[]; payments: Row[]; latest: Row[] }>('overview'),
  )
  if (loading) return <Busy />
  if (error || !data) return <Note>{error?.message}</Note>

  const upcoming = data.workshops.filter((w) => w.status !== 'draft')
  const tiles: [string, number | string][] = [
    ['Upcoming workshops', upcoming.length],
    ['Confirmed people', upcoming.reduce((n, w) => n + (w.counts.confirmed ?? 0), 0)],
    ['Payments to check', data.payments.length],
    ['Interested or waiting', upcoming.reduce((n, w) => n + (w.counts.waitlisted ?? 0) + (w.counts.interested ?? 0), 0)],
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[2rem] leading-tight text-ink">Overview</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, n]) => (
          <div key={label} className={`rounded-2xl p-4 ring-1 ring-ink/8 ${label === 'Payments to check' && n ? 'bg-[#fbe2bd]' : 'bg-white'}`}>
            <p className="font-display text-[2rem] leading-none text-ink">{n}</p>
            <p className="mt-1.5 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      {data.payments.length > 0 && (
        <Card title="Payments to check" action={<span className="text-sm text-muted">Match each in your UPI account, then confirm</span>}>
          <ul className="divide-y divide-ink/8">
            {data.payments.map((r) => (
              <PaymentRow key={r.id} r={r} onDone={reload} />
            ))}
          </ul>
        </Card>
      )}

      <Card title="Upcoming workshops" action={<Link href="/admin/workshops/new" className={BTN_PRIMARY}>New workshop</Link>}>
        {data.workshops.length === 0 ? (
          <p className="text-muted">No upcoming workshops yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.workshops.map((w) => (
              <li key={w.id} className="rounded-xl bg-paper/60 p-4 ring-1 ring-ink/6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge label={WS_STATUS[w.status][0]} tone={WS_STATUS[w.status][1]} />
                      <span className="text-sm text-muted">{dateRange(w.starts_on, w.ends_on)}</span>
                    </div>
                    <p className="mt-1.5 font-semibold text-ink">{w.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/workshops/${w.id}/participants`} className={BTN_PRIMARY}>Participants</Link>
                    <Link href={`/admin/workshops/${w.id}`} className={BTN_PLAIN}>Edit</Link>
                  </div>
                </div>
                <div className="mt-3 max-w-xl">
                  <FillBar w={w} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Latest registrations">
        {data.latest.length === 0 ? (
          <p className="text-muted">No registrations yet.</p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {data.latest.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link href={`/admin/workshops/${r.workshop_id}/participants?open=${r.id}`} className="font-semibold text-ink hover:underline">
                    {r.name}
                  </Link>
                  <p className="truncate text-sm text-muted">{r.workshop_title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={regLabel(r)} tone={REG_STATUS[r.status][1]} />
                  <span className="w-20 text-right text-xs text-muted">{ago(r.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function PaymentRow({ r, onDone }: { r: Row; onDone: () => void }) {
  const [busy, setBusy] = useState('')
  const [problem, setProblem] = useState('')
  const act = async (act: 'confirm' | 'reject_payment') => {
    let note = ''
    if (act === 'reject_payment') {
      const answer = window.prompt('Why could the payment not be matched? This is included in the email to them.', 'No payment with this reference has arrived.')
      if (answer === null) return
      note = answer
    }
    setBusy(act)
    try {
      await admin('registration_action', { id: r.id, act, note })
      onDone()
    } catch (e) {
      setProblem((e as ApiError).message)
      setBusy('')
    }
  }
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-semibold text-ink">
          {r.name} · {rupees(r.amount_inr)}
        </p>
        <p className="text-sm text-muted">
          Reference <strong className="text-ink">{r.payment_reference}</strong> · note {paymentCode(r.token)} · {r.workshop_title} ·{' '}
          {ago(r.payment_submitted_at)}
        </p>
        {problem && <p className="mt-1 text-sm text-[#a13a28]">{problem}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={!!busy} onClick={() => act('confirm')} className={BTN_PRIMARY}>
          {busy === 'confirm' ? 'Confirming…' : 'Confirm'}
        </button>
        <button type="button" disabled={!!busy} onClick={() => act('reject_payment')} className={BTN_PLAIN}>
          Not found
        </button>
      </div>
    </li>
  )
}
