import { useState } from 'react'
import { dateRange, navigate, rupees, useLoad, type ApiError, type Workshop } from '../lib'
import { Badge, Busy, Card, FillBar, Link, Note } from './kit'
import { type AdminWorkshop, BTN_PLAIN, BTN_PRIMARY, moveStatus, STATUS_MOVES, WS_STATUS } from './util'
import { admin } from './session'

export default function WorkshopList() {
  const { data, error, loading, reload } = useLoad('workshops', () => admin<AdminWorkshop[]>('workshops'))
  if (loading) return <Busy />
  if (error || !data) return <Note>{error?.message}</Note>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[2rem] leading-tight text-ink">Workshops</h1>
        <Link href="/admin/workshops/new" className={BTN_PRIMARY}>New workshop</Link>
      </div>
      {data.length === 0 && <Card><p className="text-muted">No workshops yet.</p></Card>}
      <ul className="space-y-4">
        {data.map((w) => (
          <WorkshopRow key={w.id} w={w} onChange={reload} />
        ))}
      </ul>
    </div>
  )
}

function WorkshopRow({ w, onChange }: { w: AdminWorkshop; onChange: () => void }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null)

  async function move(to: Workshop['status'], confirmText?: string) {
    setBusy(true)
    setMessage(null)
    try {
      const result = await moveStatus(w, to, confirmText)
      if (result?.emailed) setMessage({ tone: 'ok', text: `Cancelled. ${result.emailed} people were emailed.` })
      if (result) onChange()
    } catch (e) {
      setMessage({ tone: 'error', text: (e as ApiError).message })
    } finally {
      setBusy(false)
    }
  }

  async function duplicate() {
    setBusy(true)
    try {
      const copy = await admin<AdminWorkshop>('duplicate_workshop', { id: w.id })
      navigate(`/admin/workshops/${copy.id}`)
    } catch (e) {
      setMessage({ tone: 'error', text: (e as ApiError).message })
      setBusy(false)
    }
  }

  return (
    <li>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge label={WS_STATUS[w.status][0]} tone={WS_STATUS[w.status][1]} />
              <span className="text-sm text-muted">{dateRange(w.starts_on, w.ends_on)}</span>
              <span className="text-sm text-muted">· {w.fee_inr ? rupees(w.fee_inr) : 'Free'}</span>
            </div>
            <h2 className="mt-2 font-display text-[1.35rem] leading-snug text-ink">{w.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/workshops/${w.id}/participants`} className={BTN_PRIMARY}>Participants</Link>
            <Link href={`/admin/workshops/${w.id}`} className={BTN_PLAIN}>Edit</Link>
            <button type="button" disabled={busy} onClick={duplicate} className={BTN_PLAIN}>Duplicate</button>
            {w.status !== 'draft' && (
              <a href={`/workshops/${w.slug}`} target="_blank" rel="noopener noreferrer" className={BTN_PLAIN}>
                View page<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
        {w.status !== 'draft' && (
          <div className="mt-4 max-w-xl">
            <FillBar w={w} />
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/8 pt-4">
          {STATUS_MOVES[w.status].map((m) => (
            <button key={m.to} type="button" disabled={busy} onClick={() => move(m.to, m.confirm)} className={`${BTN_PLAIN} h-9`}>
              {m.label}
            </button>
          ))}
        </div>
        {message && <div className="mt-3"><Note tone={message.tone}>{message.text}</Note></div>}
      </Card>
    </li>
  )
}
