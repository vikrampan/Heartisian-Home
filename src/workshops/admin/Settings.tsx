import { useState } from 'react'
import { useLoad, type ApiError, type Settings as SettingsData } from '../lib'
import { Spinner } from '../ui'
import { Busy, Card, Field, Input, Note } from './kit'
import { BTN_PLAIN, BTN_PRIMARY } from './util'
import { admin } from './session'

export default function Settings({ email }: { email: string }) {
  const settings = useLoad('settings', () => admin<SettingsData>('settings'))
  const admins = useLoad('admins', () => admin<{ email: string; created_at: string }[]>('admins'))
  const [edits, setForm] = useState<SettingsData | null>(null)
  const form = edits ?? settings.data ?? null
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null)
  const [newAdmin, setNewAdmin] = useState('')
  const [adminProblem, setAdminProblem] = useState('')

  if (settings.error) return <Note>{settings.error.message}</Note>
  if (!form) return <Busy />
  const set = <K extends keyof SettingsData>(k: K, v: SettingsData[K]) => setForm({ ...form, [k]: v })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[2rem] leading-tight text-ink">Settings</h1>
      <Card title="Payments">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="UPI ID people pay to" hint="Shown with a QR code on each booking page. A business (merchant) UPI ID works most reliably for payments from links.">
            <Input value={form.upi_id} onChange={(e) => set('upi_id', e.target.value)} placeholder="name@bank" />
          </Field>
          <Field label="Name shown for the payment">
            <Input value={form.payee_name} onChange={(e) => set('payee_name', e.target.value)} />
          </Field>
          <Field label="Hold an unpaid place for (hours)" hint="Default for every paid workshop; each workshop can change it.">
            <Input type="number" min={1} max={336} value={form.default_hold_hours} onChange={(e) => set('default_hold_hours', Number(e.target.value))} />
          </Field>
        </div>
      </Card>
      <Card title="Emails">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Team alerts go to" hint="New registrations, payments to check and cancellations. Leave empty for no alerts.">
            <Input type="email" value={form.team_email} onChange={(e) => set('team_email', e.target.value)} />
          </Field>
          <Field label="Replies from participants go to" hint="Shown on booking pages as the contact address.">
            <Input type="email" value={form.reply_to} onChange={(e) => set('reply_to', e.target.value)} />
          </Field>
        </div>
      </Card>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            setMessage(null)
            try {
              settings.set(await admin<SettingsData>('save_settings', form))
              setMessage({ tone: 'ok', text: 'Saved.' })
            } catch (e) {
              setMessage({ tone: 'error', text: (e as ApiError).message })
            } finally {
              setBusy(false)
            }
          }}
          className={`${BTN_PRIMARY} h-11 px-6`}
        >
          {busy && <Spinner className="h-4 w-4" />} Save settings
        </button>
        {message && <Note tone={message.tone}>{message.text}</Note>}
      </div>

      <Card title="Who can sign in to the admin">
        <p className="text-sm text-muted">
          Each person also needs a login: add them in Supabase under Authentication, Users, with the same email.
        </p>
        {admins.loading && <Busy />}
        <ul className="mt-4 divide-y divide-ink/8">
          {admins.data?.map((a) => (
            <li key={a.email} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-ink">
                {a.email} {a.email === email && <span className="text-muted">(you)</span>}
              </span>
              {a.email !== email && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Remove ${a.email}? They will no longer be able to open the admin.`)) return
                    try {
                      admins.set(await admin('set_admin', { email: a.email, remove: true }))
                    } catch (e) {
                      setAdminProblem((e as ApiError).message)
                    }
                  }}
                  className="text-sm font-semibold text-[#a13a28] hover:underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newAdmin.trim())) return setAdminProblem('Enter a valid email.')
            try {
              admins.set(await admin('set_admin', { email: newAdmin.trim() }))
              setNewAdmin('')
              setAdminProblem('')
            } catch (err) {
              setAdminProblem((err as ApiError).message)
            }
          }}
        >
          <Input type="email" value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} placeholder="name@example.com" aria-label="Email to add" />
          <button type="submit" className={`${BTN_PLAIN} shrink-0`}>Add admin</button>
        </form>
        {adminProblem && <div className="mt-2"><Note>{adminProblem}</Note></div>}
      </Card>
    </div>
  )
}
