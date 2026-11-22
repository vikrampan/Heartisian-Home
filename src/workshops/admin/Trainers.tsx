import { useState } from 'react'
import { useLoad, type ApiError, type Trainer } from '../lib'
import { Portrait, Spinner } from '../ui'
import { Busy, Card, Drawer, Field, Input, Lines, Note, TextArea } from './kit'
import { BTN_DANGER, BTN_PLAIN, BTN_PRIMARY, slugify } from './util'
import { admin, uploadPhoto } from './session'

type AdminTrainer = Trainer & { sort: number; workshops: number }

const BLANK = { id: '', slug: '', name: '', title: '', experience: '', bio: '', expertise: [] as string[], photo_url: '', sort: 0 }

export default function Trainers() {
  const { data, error, loading, reload } = useLoad('trainers', () => admin<AdminTrainer[]>('trainers'))
  const [editing, setEditing] = useState<typeof BLANK | null>(null)

  if (loading) return <Busy />
  if (error || !data) return <Note>{error?.message}</Note>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[2rem] leading-tight text-ink">Trainers</h1>
        <button type="button" onClick={() => setEditing({ ...BLANK, sort: data.length + 1 })} className={BTN_PRIMARY}>
          New trainer
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((t, i) => (
          <Card key={t.id}>
            <div className="flex items-center gap-3">
              <Portrait trainer={t} index={i} className="h-16 w-16 text-xl" />
              <div className="min-w-0">
                <p className="font-display text-xl leading-tight text-ink">{t.name}</p>
                <p className="truncate text-sm text-muted">{t.title}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              {t.photo_url ? 'Has a photo' : 'No photo yet: initials are shown'} · on {t.workshops} {t.workshops === 1 ? 'workshop' : 'workshops'}
            </p>
            <button
              type="button"
              onClick={() => setEditing({ ...BLANK, ...t, photo_url: t.photo_url ?? '' })}
              className={`${BTN_PLAIN} mt-4 w-full`}
            >
              Edit
            </button>
          </Card>
        ))}
      </div>
      {editing && (
        <TrainerForm
          initial={editing}
          index={data.findIndex((t) => t.id === editing.id)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

function TrainerForm({ initial, index, onClose, onSaved }: { initial: typeof BLANK; index: number; onClose: () => void; onSaved: () => void }) {
  const [t, setT] = useState(initial)
  const [busy, setBusy] = useState('')
  const [problem, setProblem] = useState('')
  const set = <K extends keyof typeof BLANK>(k: K, v: (typeof BLANK)[K]) =>
    setT((x) => ({ ...x, [k]: v, ...(k === 'name' && !initial.id ? { slug: slugify(String(v)) } : {}) }))

  async function save() {
    if (!t.name.trim()) return setProblem('Add a name.')
    setBusy('save')
    setProblem('')
    try {
      await admin('save_trainer', { ...t, expertise: t.expertise.map((e) => e.trim()).filter(Boolean), slug: t.slug || slugify(t.name) })
      onSaved()
    } catch (e) {
      setProblem((e as ApiError).message)
      setBusy('')
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={<p className="font-display text-[1.45rem] text-ink">{initial.id ? `Edit ${initial.name}` : 'New trainer'}</p>}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          {initial.id ? (
            <button
              type="button"
              disabled={!!busy}
              onClick={async () => {
                if (!window.confirm(`Delete ${initial.name}? They are removed from every workshop.`)) return
                setBusy('delete')
                try {
                  await admin('delete_trainer', { id: initial.id })
                  onSaved()
                } catch (e) {
                  setProblem((e as ApiError).message)
                  setBusy('')
                }
              }}
              className={BTN_DANGER}
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <button type="button" disabled={!!busy} onClick={save} className={`${BTN_PRIMARY} h-11 px-6`}>
            {busy === 'save' && <Spinner className="h-4 w-4" />} Save
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Portrait trainer={{ ...t, photo_url: t.photo_url || null }} index={Math.max(index, 0)} className="h-20 w-20 text-2xl" />
          <div className="space-y-2">
            <label className={`${BTN_PLAIN} cursor-pointer`}>
              {busy === 'photo' && <Spinner className="h-4 w-4" />}
              {t.photo_url ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setBusy('photo')
                  try {
                    set('photo_url', await uploadPhoto(file, 'trainer'))
                  } catch (err) {
                    setProblem((err as Error).message)
                  } finally {
                    setBusy('')
                  }
                }}
              />
            </label>
            {t.photo_url && (
              <button type="button" onClick={() => set('photo_url', '')} className="block text-sm font-semibold text-terracotta hover:underline">
                Remove photo
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted">A square photo with the face in the middle works best.</p>
        <Field label="Name">
          <Input value={t.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Role" hint="For example: Stabilised Earth & Sustainable Construction">
          <Input value={t.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="Experience" hint="For example: 12+ years in construction and sustainable building">
          <Input value={t.experience} onChange={(e) => set('experience', e.target.value)} />
        </Field>
        <Field label="Profile">
          <TextArea rows={7} value={t.bio} onChange={(e) => set('bio', e.target.value)} />
        </Field>
        <Field label="Areas of expertise" hint="One per line.">
          <Lines rows={6} value={t.expertise} onChange={(v) => set('expertise', v)} />
        </Field>
        <Field label="Order" hint="Lower numbers come first.">
          <Input type="number" value={t.sort} onChange={(e) => set('sort', Number(e.target.value))} />
        </Field>
        {problem && <Note>{problem}</Note>}
      </div>
    </Drawer>
  )
}
