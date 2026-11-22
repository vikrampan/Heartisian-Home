import { googleCalendarUrl, ics } from './calendar.js'
import { coverStill, previewImage } from './covers.js'
import { participantEmail, teamEmail, type ParticipantTemplate, type TeamTemplate } from './emails.js'
import { dateRange, escapeHtml, feeLabel } from './format.js'
import type { Registration, Settings, Workshop } from './types.js'
import { checkRegistration, str, type RegistrationForm } from './validate.js'

// The five server routes. They check the request, call one database function (supabase/migrations), which holds
// every rule, and then send the emails that follow from what happened. The same code runs on Vercel (prod.ts) and
// in local development against an in-process Postgres (dev/api-dev.ts).

export interface OutgoingMail {
  to: string
  subject: string
  html: string
  text: string
  template: string
  replyTo?: string
  attachments?: { filename: string; content: string }[]
}

export interface Deps {
  /** Calls a database function; throws an Error whose message is the function's error code. */
  rpc<T>(fn: string, p?: object): Promise<T>
  send(mail: OutgoingMail): Promise<{ id?: string; error?: string }>
  /** The signed-in admin's email for a login token, or null when it isn't an allowed admin. */
  adminEmail(token: string): Promise<string | null>
  /** Where the admin uploads a photo: a one-time Supabase Storage link, or (local development) inline. */
  uploadTarget(path: string): Promise<{ path: string; token: string; publicUrl: string } | { inline: true }>
  siteUrl(req: Request): string
  cronAuthorized(req: Request): boolean
}

export type Route = 'workshops' | 'preview' | 'register' | 'booking' | 'admin' | 'cron'

// ---- responses ----------------------------------------------------------------------------------------------

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Database error codes → what the person sees.
const ERRORS: Record<string, [number, string]> = {
  workshop_unavailable: [409, 'Registration for this workshop is not open.'],
  workshop_not_found: [404, 'We could not find that workshop.'],
  registration_closed: [409, 'Registration for this workshop has closed.'],
  booking_not_found: [404, 'We could not find this booking. Please use the link in your email.'],
  not_awaiting_payment: [409, 'This booking is not waiting for a payment.'],
  invalid_reference: [400, 'Please enter the payment reference (UTR) from your UPI app: 4 to 64 characters.'],
  nothing_to_accept: [409, 'There is no place waiting to be accepted on this booking.'],
  cannot_cancel: [409, 'This booking cannot be cancelled.'],
  registration_not_found: [404, 'That registration no longer exists.'],
  already_confirmed: [409, 'This person is already confirmed.'],
  no_place_free: [409, 'There is no free place. Free one up, or add a place to the workshop, first.'],
  not_verifying: [409, 'There is no payment waiting to be checked.'],
  cannot_offer: [409, 'A place can only be offered to someone interested, waiting, cancelled or whose hold ended.'],
  not_confirmed: [409, 'Only confirmed people can be checked in.'],
  seats_below_taken: [409, 'There are already more places in use than that. Cancel some first, or keep more places.'],
  dates_missing: [409, 'Set the workshop dates first.'],
  fee_missing: [409, 'Set the fee first (untick "Fee to be announced"), then offer places.'],
  upi_not_set: [409, 'Add your UPI ID in Settings first, so people can pay.'],
  invalid_status: [400, 'Unknown workshop status.'],
  cannot_remove_self: [409, 'You cannot remove yourself.'],
  trainer_not_found: [404, 'That trainer no longer exists.'],
  unknown_action: [400, 'Unknown action.'],
}

function fromDbError(e: unknown): HttpError {
  if (e instanceof HttpError) return e
  const message = e instanceof Error ? e.message : String(e)
  if (ERRORS[message]) return new HttpError(...ERRORS[message])
  if (/workshops_slug_key|trainers_slug_key/.test(message)) return new HttpError(409, 'That web address is already used. Choose another.')
  if (/violates check constraint "workshops_check"/.test(message)) return new HttpError(400, 'The end date must be on or after the start date.')
  if (/violates check constraint "workshops_check1"/.test(message)) return new HttpError(400, 'The finishing time must be after the starting time.')
  if (/workshops_slug_check|trainers_slug_check/.test(message)) return new HttpError(400, 'The web address may only use lower-case letters, numbers and single dashes.')
  if (/invalid input syntax|violates check constraint/.test(message)) return new HttpError(400, 'Some details are not valid. Please check the form.')
  console.error('[workshops]', message)
  return new HttpError(500, 'Something went wrong on our side. Please try again in a moment.')
}

async function body<T>(req: Request): Promise<T> {
  const raw = await req.text()
  if (raw.length > 50_000) throw new HttpError(413, 'That is too much text.')
  try {
    return JSON.parse(raw || '{}') as T
  } catch {
    throw new HttpError(400, 'Invalid request.')
  }
}

// ---- emails -------------------------------------------------------------------------------------------------

async function settings(deps: Deps): Promise<Settings> {
  return deps.rpc<Settings>('get_settings')
}

async function mail(
  deps: Deps,
  site: string,
  s: Settings,
  reg: Registration,
  template: ParticipantTemplate,
  note?: string,
) {
  const rendered = participantEmail(template, { reg, site, settings: s, note })
  const attachments: OutgoingMail['attachments'] = []
  if (template === 'confirmed' || template === 'reminder') {
    const file = ics(reg.workshop, reg.id, `${site}/booking/${reg.token}`)
    if (file) attachments.push({ filename: 'heartisan-home-workshop.ics', content: file })
  }
  await deliver(deps, { to: reg.email, template, replyTo: s.reply_to || undefined, attachments, ...rendered }, reg.id)
}

async function alertTeam(deps: Deps, site: string, s: Settings, reg: Registration, template: TeamTemplate, waitlist?: number) {
  if (!s.team_email) return
  const rendered = teamEmail(template, { reg, site, settings: s, waitlist })
  await deliver(deps, { to: s.team_email, template, replyTo: reg.email, ...rendered }, reg.id)
}

async function deliver(deps: Deps, m: OutgoingMail, registrationId: string) {
  let result: { id?: string; error?: string }
  try {
    result = await deps.send(m)
  } catch (e) {
    result = { error: e instanceof Error ? e.message : String(e) }
  }
  if (result.error) console.error('[workshops] email failed', m.template, m.to, result.error)
  await deps
    .rpc('log_email', {
      registration_id: registrationId,
      to_email: m.to,
      template: m.template,
      subject: m.subject,
      provider_id: result.id ?? null,
      ok: !result.error,
      error: result.error ?? null,
    })
    .catch((e) => console.error('[workshops] email log failed', e))
}

// Holds that ran out while handling a request: tell each person.
async function mailExpired(deps: Deps, site: string, s: Settings, expired: Registration[] | undefined) {
  for (const reg of expired ?? []) await mail(deps, site, s, reg, 'hold_expired')
}

const EMAIL_FOR_STATUS: Record<Registration['status'], (r: Registration) => ParticipantTemplate> = {
  confirmed: () => 'confirmed',
  held: () => 'held',
  waitlisted: () => 'waitlisted',
  interested: () => 'interested',
  verifying: () => 'payment_received',
  cancelled: () => 'cancelled',
  expired: () => 'hold_expired',
}

// ---- public: workshops --------------------------------------------------------------------------------------

async function workshops(req: Request, deps: Deps) {
  if (req.method !== 'GET') throw new HttpError(405, 'Method not allowed')
  const slug = new URL(req.url).searchParams.get('slug')
  const data = slug ? await deps.rpc('public_workshop', { slug }) : await deps.rpc('public_workshops')
  // places left change often, so the copy shared between visitors is kept for only a few seconds
  return json(data, 200, { 'cache-control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=60' })
}

// ---- public: link previews ----------------------------------------------------------------------------------
// WhatsApp, Facebook, LinkedIn and X don't run the site's JavaScript, so when someone shares a workshop link their
// crawlers would only see the bare site. vercel.json sends those crawlers here instead, for a page that carries the
// workshop's title, dates, venue and photo. People who open the link get the normal site.

async function preview(req: Request, deps: Deps) {
  if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed')
  const site = new URL(req.url).origin
  const slug = new URL(req.url).searchParams.get('slug')
  let w: Workshop | null = null
  if (slug) {
    try {
      w = await deps.rpc<Workshop>('public_workshop', { slug })
    } catch {
      // unknown or unpublished: show the preview for the workshops page
    }
  }

  const page = w
    ? {
        title: w.title,
        description: [
          [w.dates_tba ? '' : dateRange(w.starts_on, w.ends_on), w.venue, w.fee_tba ? '' : feeLabel(w)].filter(Boolean).join(' · ') + '.',
          w.subtitle,
          w.registration_open ? (w.interest_only ? 'Register your interest now.' : 'Registration is open.') : '',
        ]
          .filter(Boolean)
          .join(' '),
        url: `${site}/workshops/${w.slug}`,
        image: w.cover_url || `${site}${previewImage(coverStill(w.slug))}`,
        sized: !w.cover_url,
      }
    : {
        title: 'Workshops at Kanha Shanti Vanam',
        description: 'Hands-on workshops in earth and lime building: real materials, demonstrations and supervised practice, led by trainers who build this way every day.',
        url: `${site}/workshops`,
        image: `${site}${previewImage('house-build')}`,
        sized: true,
      }

  const e = escapeHtml
  const meta = (attr: 'property' | 'name', key: string, value: string) => `<meta ${attr}="${key}" content="${e(value)}" />`
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${e(page.title)} — Heartisan Home</title>
<link rel="canonical" href="${e(page.url)}" />
${[
  meta('name', 'description', page.description),
  meta('property', 'og:type', 'website'),
  meta('property', 'og:site_name', 'Heartisan Home'),
  meta('property', 'og:locale', 'en_IN'),
  meta('property', 'og:title', page.title),
  meta('property', 'og:description', page.description),
  meta('property', 'og:url', page.url),
  meta('property', 'og:image', page.image),
  ...(page.sized ? [meta('property', 'og:image:width', '1200'), meta('property', 'og:image:height', '630'), meta('property', 'og:image:type', 'image/jpeg')] : []),
  meta('name', 'twitter:card', 'summary_large_image'),
  meta('name', 'twitter:title', page.title),
  meta('name', 'twitter:description', page.description),
  meta('name', 'twitter:image', page.image),
].join('\n')}
</head>
<body>
<h1>${e(page.title)}</h1>
<p>${e(page.description)}</p>
<p><a href="${e(page.url)}">${e(page.url)}</a></p>
</body>
</html>
`
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' },
  })
}

// ---- public: registration -----------------------------------------------------------------------------------

async function register(req: Request, deps: Deps) {
  if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed')
  const raw = await body<Partial<RegistrationForm>>(req)
  if (raw.website) throw new HttpError(400, 'Invalid request.')
  const { form, errors } = checkRegistration(raw)
  if (Object.keys(errors).length) return json({ error: 'Please check the highlighted fields.', fields: errors }, 400)

  const result = await deps.rpc<{ duplicate: boolean; registration: Registration; expired: Registration[] }>('register', form)
  const site = deps.siteUrl(req)
  const s = await settings(deps)
  const reg = result.registration
  await mailExpired(deps, site, s, result.expired)

  // Someone already registered with this email: send the link to that inbox rather than showing it here.
  if (result.duplicate) {
    await mail(deps, site, s, reg, 'booking_link')
    return json({ duplicate: true, email: reg.email })
  }
  await mail(deps, site, s, reg, EMAIL_FOR_STATUS[reg.status](reg))
  await alertTeam(deps, site, s, reg, 'team_registration')
  return json({ token: reg.token, status: reg.status }, 201)
}

// ---- public: the private booking page -----------------------------------------------------------------------

interface BookingView {
  registration: Registration
  payment: { upi_id: string; payee_name: string; qr_url: string | null }
  contact_email: string | null
  expired: Registration[]
}

async function bookingView(deps: Deps, req: Request, token: string) {
  const view = await deps.rpc<BookingView>('booking', { token })
  const site = deps.siteUrl(req)
  if (view.expired.length) await mailExpired(deps, site, await settings(deps), view.expired)
  const { expired: _expired, ...rest } = view
  const r = view.registration
  return {
    ...rest,
    calendar: r.status === 'confirmed' ? googleCalendarUrl(r.workshop, `${site}/booking/${r.token}`) : null,
  }
}

async function booking(req: Request, deps: Deps) {
  const url = new URL(req.url)
  if (req.method === 'GET') {
    const token = url.searchParams.get('token') ?? ''
    if (url.searchParams.get('format') === 'ics') {
      const view = await deps.rpc<BookingView>('booking', { token })
      if (view.expired.length) await mailExpired(deps, deps.siteUrl(req), await settings(deps), view.expired)
      const r = view.registration
      const file = r.status === 'confirmed' ? ics(r.workshop, r.id, `${deps.siteUrl(req)}/booking/${r.token}`) : null
      if (!file) throw new HttpError(404, 'No calendar entry for this booking.')
      return new Response(file, {
        headers: {
          'content-type': 'text/calendar; charset=utf-8',
          'content-disposition': 'attachment; filename="heartisan-home-workshop.ics"',
          'cache-control': 'no-store',
        },
      })
    }
    return json(await bookingView(deps, req, token))
  }
  if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed')

  const { token, action, reference } = await body<{ token: string; action: string; reference?: string }>(req)
  const site = deps.siteUrl(req)
  const s = await settings(deps)
  type Result = { registration: Registration; expired: Registration[]; freed_place?: boolean; waitlist?: number }
  let result: Result
  if (action === 'pay') {
    result = await deps.rpc<Result>('submit_payment', { token, reference: str(reference, 80) })
    await mailExpired(deps, site, s, result.expired)
    await mail(deps, site, s, result.registration, 'payment_received')
    await alertTeam(deps, site, s, result.registration, 'team_payment')
  } else if (action === 'accept') {
    result = await deps.rpc<Result>('accept_place', { token })
    await mailExpired(deps, site, s, result.expired)
    await mail(deps, site, s, result.registration, 'confirmed')
  } else if (action === 'cancel') {
    result = await deps.rpc<Result>('participant_cancel', { token })
    await mailExpired(deps, site, s, result.expired)
    await mail(deps, site, s, result.registration, 'cancelled')
    if (result.freed_place) await alertTeam(deps, site, s, result.registration, 'team_cancelled', result.waitlist)
  } else {
    throw new HttpError(400, 'Unknown action.')
  }
  return json(await bookingView(deps, req, token))
}

// ---- admin --------------------------------------------------------------------------------------------------

// Admin actions that only read or write data, each mapped to its database function.
const ADMIN_CALLS: Record<string, string> = {
  overview: 'admin_overview',
  workshops: 'admin_workshops',
  workshop: 'admin_workshop',
  save_workshop: 'admin_save_workshop',
  duplicate_workshop: 'admin_duplicate_workshop',
  registrations: 'admin_registrations',
  registration: 'admin_registration',
  trainers: 'admin_trainers',
  save_trainer: 'admin_save_trainer',
  delete_trainer: 'admin_delete_trainer',
  settings: 'get_settings',
  save_settings: 'admin_save_settings',
  admins: 'admin_admins',
  set_admin: 'admin_set_admin',
}

// After a team action on a registration, the email that person receives.
const EMAIL_FOR_ACTION: Record<string, (r: Registration) => ParticipantTemplate | null> = {
  confirm: () => 'confirmed',
  reject_payment: () => 'payment_not_verified',
  cancel: () => 'cancelled',
  offer_place: () => 'place_offered',
}

async function admin(req: Request, deps: Deps) {
  if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed')
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const email = token ? await deps.adminEmail(token) : null
  if (!email) throw new HttpError(401, 'Please sign in with an admin account.')

  const { action, ...payload } = await body<{ action: string } & Record<string, unknown>>(req)
  const p = { ...payload, actor: email }
  const site = deps.siteUrl(req)

  if (action === 'me') return json({ email })
  if (ADMIN_CALLS[action]) return json(await deps.rpc(ADMIN_CALLS[action], p))

  if (action === 'workshop_status') {
    const result = await deps.rpc<{ workshop: unknown; cancelled_registrations: Registration[] }>('admin_workshop_status', p)
    const s = await settings(deps)
    for (const reg of result.cancelled_registrations) await mail(deps, site, s, reg, 'workshop_cancelled')
    return json({ workshop: result.workshop, emailed: result.cancelled_registrations.length })
  }

  if (action === 'registration_action') {
    // `act` is what to do to the registration: confirm, reject_payment, cancel, offer_place, check_in, …
    const act = String(payload.act ?? '')
    const note = str(payload.note, 500)
    const result = await deps.rpc<{ registration: Registration; expired: Registration[] }>('admin_action', {
      id: payload.id,
      action: act,
      note,
      actor: email,
    })
    const s = await settings(deps)
    await mailExpired(deps, site, s, result.expired)
    const template = EMAIL_FOR_ACTION[act]?.(result.registration)
    if (template && payload.notify !== false) await mail(deps, site, s, result.registration, template, note || undefined)
    return json(await deps.rpc('admin_registration', { id: result.registration.id }))
  }

  if (action === 'offer_all') {
    const result = await deps.rpc<{ offered: Registration[]; expired: Registration[] }>('admin_offer_all', p)
    const s = await settings(deps)
    await mailExpired(deps, site, s, result.expired)
    for (const reg of result.offered) await mail(deps, site, s, reg, 'place_offered')
    return json({ offered: result.offered.length })
  }

  if (action === 'resend_email') {
    const { registration: reg } = await deps.rpc<{ registration: Registration }>('admin_registration', p)
    const template = reg.status === 'held' && reg.amount_inr === 0 ? 'place_offered' : EMAIL_FOR_STATUS[reg.status](reg)
    await mail(deps, site, await settings(deps), reg, template, reg.cancel_reason ?? undefined)
    return json(await deps.rpc('admin_registration', { id: reg.id }))
  }

  if (action === 'upload_target') {
    const kind = payload.kind === 'trainer' ? 'trainers' : payload.kind === 'qr' ? 'payments' : 'covers'
    const ext = String(payload.ext ?? 'webp').replace(/[^a-z0-9]/g, '').slice(0, 5) || 'webp'
    return json(await deps.uploadTarget(`${kind}/${crypto.randomUUID()}.${ext}`))
  }

  throw new HttpError(400, 'Unknown action.')
}

// ---- daily job ----------------------------------------------------------------------------------------------

async function cron(req: Request, deps: Deps) {
  if (!deps.cronAuthorized(req)) throw new HttpError(401, 'Not allowed.')
  const result = await deps.rpc<{ expired: Registration[]; reminders: Registration[] }>('cron_tick')
  const site = deps.siteUrl(req)
  const s = await settings(deps)
  await mailExpired(deps, site, s, result.expired)
  for (const reg of result.reminders) await mail(deps, site, s, reg, 'reminder')
  if (result.reminders.length) await deps.rpc('mark_reminded', { ids: result.reminders.map((r) => r.id) })
  return json({ expired: result.expired.length, reminded: result.reminders.length })
}

// ---- entry --------------------------------------------------------------------------------------------------

const ROUTES: Record<Route, (req: Request, deps: Deps) => Promise<Response>> = { workshops, preview, register, booking, admin, cron }

export async function handle(route: Route, req: Request, getDeps: () => Deps): Promise<Response> {
  try {
    return await ROUTES[route](req, getDeps())
  } catch (e) {
    const err = fromDbError(e)
    return json({ error: err.message }, err.status)
  }
}
