import { PGlite } from '@electric-sql/pglite'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { handle, type Deps, type Route } from '../api/_lib/core.js'
import { prodDeps } from '../api/_lib/prod.js'

// Local development only (loaded by the dev server in vite.config.ts, never deployed).
// Without Supabase keys in .env.local, the workshop routes run against an in-process Postgres kept in .dev-db/,
// built from the same migrations as the live database plus sample data (dev/seed-dev.sql). Emails are saved as
// HTML files in .dev-mail/ instead of being sent. The admin signs in with the password "dev".
// With SUPABASE_SERVICE_ROLE_KEY set in .env.local, the real Supabase and Resend are used instead.

const ROOT = process.cwd()
const DB_DIR = join(ROOT, '.dev-db')
const MAIL_DIR = join(ROOT, '.dev-mail')
export const DEV_ADMIN_TOKEN = 'dev-admin'

let db: Promise<PGlite> | null = null

function database() {
  db ??= (async () => {
    const fresh = !existsSync(join(DB_DIR, 'PG_VERSION'))
    const pg = new PGlite(DB_DIR)
    if (fresh) {
      // what every Supabase project already has
      await pg.exec('create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;')
      const dir = join(ROOT, 'supabase/migrations')
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
        await pg.exec(readFileSync(join(dir, file), 'utf8'))
      }
      await pg.exec(readFileSync(join(ROOT, 'dev/seed-dev.sql'), 'utf8'))
      console.log('[dev api] created the local workshops database in .dev-db/ (delete the folder to start again)')
    }
    return pg
  })()
  return db
}

function localDeps(): Deps {
  return {
    async rpc<T>(fn: string, p: object = {}) {
      if (!/^[a-z_]+$/.test(fn)) throw new Error('bad function name')
      const pg = await database()
      const { rows } = await pg.query<{ r: T }>(`select public.${fn}($1::jsonb) as r`, [JSON.stringify(p)])
      return rows[0].r
    },
    async send(m) {
      mkdirSync(MAIL_DIR, { recursive: true })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const file = join(MAIL_DIR, `${stamp}-${m.template}-${m.to.replace(/[^a-z0-9@.]/gi, '_')}.html`)
      const attached = m.attachments?.map((a) => `<p style="font:12px monospace">Attachment: ${a.filename}</p>`).join('') ?? ''
      writeFileSync(file, `<!-- To: ${m.to} | Subject: ${m.subject} -->\n${m.html}${attached}`)
      for (const a of m.attachments ?? []) writeFileSync(file.replace(/\.html$/, `-${a.filename}`), a.content)
      console.log(`[dev api] email "${m.subject}" → ${m.to} (saved in .dev-mail/)`)
      return { id: `dev-${stamp}` }
    },
    async adminEmail(token) {
      return token === DEV_ADMIN_TOKEN ? 'dev@localhost' : null
    },
    async uploadTarget() {
      return { inline: true }
    },
    siteUrl(req) {
      return new URL(req.url).origin
    },
    cronAuthorized() {
      return true
    },
  }
}

const deps = () => (process.env.SUPABASE_SERVICE_ROLE_KEY ? prodDeps() : localDeps())

export async function serve(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  // stand-in for the admin's sign-in, only while there is no Supabase to sign in with
  if (url.pathname === '/api/dev-login' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ token: DEV_ADMIN_TOKEN }))
    return
  }

  const route = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '') as Route
  if (!['workshops', 'register', 'booking', 'admin', 'cron'].includes(route)) {
    res.statusCode = 404
    res.end('Not found')
    return
  }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
  })
  const response = await handle(route, request, deps)
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(Buffer.from(await response.arrayBuffer()))
}
