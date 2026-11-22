import { useEffect, useState } from 'react'
import { navigate, rupees, useLoad, type ApiError, type Day, type Trainer } from '../lib'
import { Portrait, Spinner } from '../ui'
import { Badge, Busy, Card, Field, Input, Lines, Note, TextArea } from './kit'
import { type AdminWorkshop, BTN_DANGER, BTN_PLAIN, BTN_PRIMARY, moveStatus, slugify, STATUS_MOVES, WS_STATUS } from './util'
import { admin, uploadPhoto } from './session'

// Create or edit a workshop: every detail shown on its page, its schedule, trainers and cover photo.

interface Form {
  id?: string
  slug: string
  title: string
  subtitle: string
  summary: string
  level: string
  format: string
  starts_on: string
  ends_on: string
  daily_start: string
  daily_end: string
  registration_closes_at: string
  venue: string
  venue_address: string
  seats: string
  fee_inr: string
  hold_hours: string
  outcomes: string[]
  schedule: Day[]
  provided: string[]
  bring: string[]
  safety_note: string
  cover_url: string
  trainer_ids: string[]
}

const BLANK: Form = {
  slug: '',
  title: '',
  subtitle: '',
  summary: '',
  level: 'Introductory',
  format: '',
  starts_on: '',
  ends_on: '',
  daily_start: '09:30',
  daily_end: '17:30',
  registration_closes_at: '',
  venue: 'Kanha Shanti Vanam',
  venue_address: 'Kanha Shanti Vanam, Telangana',
  seats: '20',
  fee_inr: '0',
  hold_hours: '',
  outcomes: [],
  schedule: [],
  provided: [],
  bring: [],
  safety_note: '',
  cover_url: '',
  trainer_ids: [],
}

// datetime-local works in local time; the database keeps an exact moment
const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function fromWorkshop(w: AdminWorkshop): Form {
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    subtitle: w.subtitle,
    summary: w.summary,
    level: w.level,
    format: w.format,
    starts_on: w.starts_on ?? '',
    ends_on: w.ends_on ?? '',
    daily_start: w.daily_start?.slice(0, 5) ?? '',
    daily_end: w.daily_end?.slice(0, 5) ?? '',
    registration_closes_at: toLocalInput(w.registration_closes_at),
    venue: w.venue,
    venue_address: w.venue_address,
    seats: String(w.seats),
    fee_inr: String(w.fee_inr),
    hold_hours: w.hold_hours ? String(w.hold_hours) : '',
    outcomes: w.outcomes,
    schedule: w.schedule,
    provided: w.provided,
    bring: w.bring,
    safety_note: w.safety_note,
    cover_url: w.cover_url ?? '',
    trainer_ids: w.trainers.map((t) => t.id),
  }
}

const clean = (lines: string[]) => lines.map((l) => l.trim()).filter(Boolean)

export default function WorkshopEditor({ id }: { id?: string }) {
  const workshop = useLoad(id ? `edit:${id}` : null, () => admin<AdminWorkshop>('workshop', { id }))
  const trainers = useLoad('trainers', () => admin<Trainer[]>('trainers'))
  // until the first change, the form shows the loaded workshop (or a blank one)
  const [edits, setForm] = useState<Form | null>(null)
  const form = edits ?? (id ? (workshop.data ? fromWorkshop(workshop.data) : null) : BLANK)
  const [slugTouched, setSlugTouched] = useState(!!id)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (workshop.error) return <Note>{workshop.error.message}</Note>
  if (!form) return <Busy />

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => {
      const f = current ?? form
      if (!f) return current
      const next = { ...f, [key]: value }
      if (key === 'title' && !slugTouched) next.slug = slugify(String(value))
      if (key === 'starts_on' && (!f.ends_on || f.ends_on < String(value))) next.ends_on = String(value)
      return next
    })
    setDirty(true)
  }

  async function save() {
    if (!form) return
    setSaving(true)
    setMessage(null)
    try {
      const saved = await admin<AdminWorkshop>('save_workshop', {
        ...form,
        seats: Number(form.seats) || 0,
        fee_inr: Math.round(Number(form.fee_inr) || 0),
        hold_hours: form.hold_hours ? Number(form.hold_hours) : '',
        registration_closes_at: form.registration_closes_at ? new Date(form.registration_closes_at).toISOString() : '',
        outcomes: clean(form.outcomes),
        provided: clean(form.provided),
        bring: clean(form.bring),
        schedule: form.schedule.map((d) => ({
          title: d.title.trim(),
          sessions: d.sessions.filter((s) => s.title.trim()),
          outputs: clean(d.outputs),
        })),
      })
      setDirty(false)
      setMessage({ tone: 'ok', text: 'Saved.' })
      if (!id) navigate(`/admin/workshops/${saved.id}`, { replace: true })
      else workshop.set(saved)
    } catch (e) {
      setMessage({ tone: 'error', text: (e as ApiError).message })
    } finally {
      setSaving(false)
    }
  }

  async function move(to: AdminWorkshop['status'], confirmText?: string) {
    if (!workshop.data) return
    if (dirty) return setMessage({ tone: 'error', text: 'Save your changes first.' })
    try {
      const result = await moveStatus(workshop.data, to, confirmText)
      if (!result) return
      workshop.set(result.workshop)
      setMessage({ tone: 'ok', text: result.emailed ? `Cancelled. ${result.emailed} people were emailed.` : `Now: ${WS_STATUS[result.workshop.status][0]}.` })
    } catch (e) {
      setMessage({ tone: 'error', text: (e as ApiError).message })
    }
  }

  const w = workshop.data

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{id ? 'Edit workshop' : 'New workshop'}</p>
          <h1 className="font-display text-[1.9rem] leading-tight text-ink">{form.title || 'Untitled workshop'}</h1>
          {w && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge label={WS_STATUS[w.status][0]} tone={WS_STATUS[w.status][1]} />
              {w.status !== 'draft' && (
                <a href={`/workshops/${w.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-terracotta hover:underline">
                  View page<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </div>
        {w && (
          <div className="flex flex-wrap gap-2">
            {STATUS_MOVES[w.status].map((m) => (
              <button key={m.to} type="button" onClick={() => move(m.to, m.confirm)} className={m.to === 'cancelled' ? BTN_DANGER : m.to === 'published' ? BTN_PRIMARY : BTN_PLAIN}>
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {w?.status === 'draft' && (
        <Note tone="info">This is a draft: it is not on the website. Fill in the dates, places and fee, save, then publish.</Note>
      )}

      <Card title="Basics">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" className="md:col-span-2">
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Web address" hint={`heartisanhome.com/workshops/${form.slug || '…'}`} className="md:col-span-2">
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                set('slug', slugify(e.target.value))
              }}
            />
          </Field>
          <Field label="One-line description" className="md:col-span-2">
            <Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          </Field>
          <Field label="Level" hint="For example: Introductory">
            <Input value={form.level} onChange={(e) => set('level', e.target.value)} />
          </Field>
          <Field label="Format" hint="For example: 2 days · Demonstrations and supervised hands-on practice">
            <Input value={form.format} onChange={(e) => set('format', e.target.value)} />
          </Field>
          <Field label="About the workshop" className="md:col-span-2">
            <TextArea rows={4} value={form.summary} onChange={(e) => set('summary', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Dates & place">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="First day">
            <Input type="date" value={form.starts_on} onChange={(e) => set('starts_on', e.target.value)} />
          </Field>
          <Field label="Last day">
            <Input type="date" value={form.ends_on} min={form.starts_on} onChange={(e) => set('ends_on', e.target.value)} />
          </Field>
          <Field label="Starts each day">
            <Input type="time" value={form.daily_start} onChange={(e) => set('daily_start', e.target.value)} />
          </Field>
          <Field label="Ends each day">
            <Input type="time" value={form.daily_end} onChange={(e) => set('daily_end', e.target.value)} />
          </Field>
          <Field label="Venue" className="sm:col-span-2">
            <Input value={form.venue} onChange={(e) => set('venue', e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={form.venue_address} onChange={(e) => set('venue_address', e.target.value)} />
          </Field>
          <Field label="Registration closes" hint="Leave empty to close when the workshop starts." className="sm:col-span-2">
            <Input type="datetime-local" value={form.registration_closes_at} onChange={(e) => set('registration_closes_at', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Places & fee">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Places">
            <Input type="number" min={1} max={500} value={form.seats} onChange={(e) => set('seats', e.target.value)} />
          </Field>
          <Field label="Fee per person (₹)" hint={Number(form.fee_inr) ? `${rupees(Number(form.fee_inr))}, paid by UPI and confirmed by you` : 'Free: places are confirmed straight away'}>
            <Input type="number" min={0} step={50} value={form.fee_inr} onChange={(e) => set('fee_inr', e.target.value)} />
          </Field>
          <Field label="Hold an unpaid place for (hours)" hint="Leave empty to use the default in Settings.">
            <Input type="number" min={1} max={336} value={form.hold_hours} onChange={(e) => set('hold_hours', e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card title="Trainers">
        {trainers.loading && <Busy />}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.data?.map((t, i) => {
            const on = form.trainer_ids.includes(t.id)
            return (
              <label key={t.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${on ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta' : 'border-ink/12 bg-white'}`}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => set('trainer_ids', on ? form.trainer_ids.filter((x) => x !== t.id) : [...form.trainer_ids, t.id])}
                  className="h-4 w-4 accent-[#9f5738]"
                />
                <Portrait trainer={t} index={i} className="h-10 w-10 text-sm" />
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{t.name}</span>
                  <span className="block truncate text-xs text-muted">{t.title}</span>
                </span>
              </label>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted">They appear on the page in the order you tick them. Add or edit trainers under Trainers.</p>
      </Card>

      <Card title="Cover photo">
        <div className="flex flex-wrap items-start gap-5">
          <img
            src={form.cover_url || '/images/hero/hero-wide.webp'}
            alt=""
            className="aspect-[4/3] w-full max-w-xs rounded-xl object-cover ring-1 ring-ink/10"
          />
          <div className="space-y-3">
            <p className="max-w-sm text-sm text-muted">
              {form.cover_url ? 'Your photo.' : 'Without one, the page uses the photo of the earthen wall being plastered.'} A landscape photo works best.
            </p>
            <label className={`${BTN_PLAIN} cursor-pointer`}>
              {uploading ? <Spinner className="h-4 w-4" /> : null}
              {uploading ? 'Uploading…' : 'Upload a photo'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  try {
                    set('cover_url', await uploadPhoto(file, 'cover'))
                  } catch (err) {
                    setMessage({ tone: 'error', text: (err as Error).message })
                  } finally {
                    setUploading(false)
                  }
                }}
              />
            </label>
            {form.cover_url && (
              <button type="button" onClick={() => set('cover_url', '')} className="block text-sm font-semibold text-terracotta hover:underline">
                Use the default photo
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card title="What people will learn">
        <Field label="Learning outcomes" hint="One per line.">
          <Lines rows={6} value={form.outcomes} onChange={(v) => set('outcomes', v)} />
        </Field>
      </Card>

      <ScheduleEditor days={form.schedule} onChange={(d) => set('schedule', d)} />

      <Card title="Practical details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Provided" hint="One per line, e.g. tools, materials, protective equipment.">
            <Lines value={form.provided} onChange={(v) => set('provided', v)} />
          </Field>
          <Field label="Please bring" hint="One per line. Leave empty to hide.">
            <Lines value={form.bring} onChange={(v) => set('bring', v)} />
          </Field>
          <Field label="Safety & technical scope" className="md:col-span-2">
            <TextArea rows={4} value={form.safety_note} onChange={(e) => set('safety_note', e.target.value)} />
          </Field>
        </div>
      </Card>

      {/* stays in reach at the bottom of the screen */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 text-sm">
            {message ? (
              <span className={message.tone === 'error' ? 'text-[#a13a28]' : 'text-[#46542a]'}>{message.text}</span>
            ) : (
              <span className="text-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
            )}
          </div>
          <button type="button" onClick={save} disabled={saving} className={`${BTN_PRIMARY} h-11 px-6`}>
            {saving && <Spinner className="h-4 w-4" />}
            {id ? 'Save changes' : 'Create workshop'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ScheduleEditor({ days, onChange }: { days: Day[]; onChange: (d: Day[]) => void }) {
  const update = (i: number, d: Day) => onChange(days.map((x, j) => (j === i ? d : x)))
  const move = <T,>(list: T[], from: number, to: number) => {
    const copy = [...list]
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    return copy
  }
  return (
    <Card
      title="Day by day"
      action={
        <button type="button" onClick={() => onChange([...days, { title: '', sessions: [{ title: '', content: '', method: '' }], outputs: [] }])} className={BTN_PLAIN}>
          Add a day
        </button>
      }
    >
      {days.length === 0 && <p className="text-sm text-muted">No schedule yet. Add a day to start.</p>}
      <div className="space-y-5">
        {days.map((d, i) => (
          <div key={i} className="rounded-xl bg-paper/70 p-4 ring-1 ring-ink/8">
            <div className="flex flex-wrap items-end gap-3">
              <Field label={`Day ${i + 1} title`} className="min-w-[14rem] flex-1">
                <Input value={d.title} onChange={(e) => update(i, { ...d, title: e.target.value })} />
              </Field>
              <button type="button" onClick={() => window.confirm(`Remove day ${i + 1}?`) && onChange(days.filter((_, j) => j !== i))} className={BTN_DANGER}>
                Remove day
              </button>
            </div>
            <ol className="mt-4 space-y-3">
              {d.sessions.map((s, k) => {
                const setS = (patch: Partial<typeof s>) => update(i, { ...d, sessions: d.sessions.map((x, m) => (m === k ? { ...x, ...patch } : x)) })
                return (
                  <li key={k} className="rounded-lg bg-white p-3 ring-1 ring-ink/8">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Session {k + 1}</span>
                      <span className="flex gap-1">
                        <button type="button" disabled={k === 0} onClick={() => update(i, { ...d, sessions: move(d.sessions, k, k - 1) })} className="rounded px-2 py-1 text-xs text-muted hover:bg-ink/5 disabled:opacity-30">Up</button>
                        <button type="button" disabled={k === d.sessions.length - 1} onClick={() => update(i, { ...d, sessions: move(d.sessions, k, k + 1) })} className="rounded px-2 py-1 text-xs text-muted hover:bg-ink/5 disabled:opacity-30">Down</button>
                        <button type="button" onClick={() => update(i, { ...d, sessions: d.sessions.filter((_, m) => m !== k) })} className="rounded px-2 py-1 text-xs text-[#a13a28] hover:bg-[#a13a28]/10">Remove</button>
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr]">
                      <Input placeholder="Session title" value={s.title} onChange={(e) => setS({ title: e.target.value })} />
                      <Input placeholder="Method, e.g. Demonstration; hands-on" value={s.method} onChange={(e) => setS({ method: e.target.value })} />
                      <TextArea rows={2} placeholder="What it covers" value={s.content} onChange={(e) => setS({ content: e.target.value })} className="md:col-span-2" />
                    </div>
                  </li>
                )
              })}
            </ol>
            <button type="button" onClick={() => update(i, { ...d, sessions: [...d.sessions, { title: '', content: '', method: '' }] })} className={`${BTN_PLAIN} mt-3 h-9`}>
              Add a session
            </button>
            <Field label="By the end of the day, they leave with" hint="One per line." className="mt-4">
              <Lines rows={3} value={d.outputs} onChange={(v) => update(i, { ...d, outputs: v })} />
            </Field>
          </div>
        ))}
      </div>
    </Card>
  )
}
