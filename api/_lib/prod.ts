import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import type { Deps, OutgoingMail } from './core.js'

// The live setup on Vercel: Supabase for data, logins and photo storage; Resend for email.
// The keys are read from Vercel's environment variables (see .env.example) and never reach the browser.

let cached: Deps | null = null

const env = (name: string) => process.env[name]?.trim() || ''

export function prodDeps(): Deps {
  if (cached) return cached
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL')
  const key = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Workshops are not set up yet: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are missing.')

  const db: SupabaseClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const resend = env('RESEND_API_KEY') ? new Resend(env('RESEND_API_KEY')) : null
  const from = env('EMAIL_FROM') || 'Heartisan Home <workshops@heartisanhome.com>'

  async function rpc<T>(fn: string, p: object = {}): Promise<T> {
    const { data, error } = await db.rpc(fn, { p })
    if (error) throw new Error(error.message)
    return data as T
  }

  // Resend accepts a few requests a second; space them out and retry once if it asks us to slow down.
  let last = 0
  async function send(m: OutgoingMail) {
    if (!resend) return { error: 'RESEND_API_KEY is not set' }
    for (let attempt = 0; attempt < 2; attempt++) {
      const wait = last + 550 - Date.now()
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      last = Date.now()
      const { data, error } = await resend.emails.send({
        from,
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
        replyTo: m.replyTo,
        attachments: m.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content) })),
      })
      if (!error) return { id: data?.id }
      if (error.name !== 'rate_limit_exceeded' || attempt === 1) return { error: `${error.name}: ${error.message}` }
      await new Promise((r) => setTimeout(r, 1100))
    }
    return { error: 'not sent' }
  }

  cached = {
    rpc,
    send,
    async adminEmail(token) {
      const { data, error } = await db.auth.getUser(token)
      const email = data.user?.email?.toLowerCase()
      if (error || !email) return null
      const { admin } = await rpc<{ admin: boolean }>('admin_is_admin', { email })
      return admin ? email : null
    },
    async uploadTarget(path) {
      const { data, error } = await db.storage.from('media').createSignedUploadUrl(path)
      if (error || !data) throw new Error(error?.message ?? 'upload link failed')
      return { path: data.path, token: data.token, publicUrl: db.storage.from('media').getPublicUrl(data.path).data.publicUrl }
    },
    siteUrl(req) {
      return (env('SITE_URL') || new URL(req.url).origin).replace(/\/$/, '')
    },
    cronAuthorized(req) {
      const secret = env('CRON_SECRET')
      return !!secret && req.headers.get('authorization') === `Bearer ${secret}`
    },
  }
  return cached
}
