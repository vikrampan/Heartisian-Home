import { place } from './calendar.js'
import { BACKGROUNDS, EXPERIENCE, dateRange, escapeHtml, feeLabel, firstName, moment, rupees, timings } from './format.js'
import type { Registration, Settings } from './types.js'

// Every email the workshops send: to participants, and short alerts to the team.
// Each is written once as plain parts (heading, paragraphs, key facts, a button) and rendered to both HTML and text.

export type ParticipantTemplate =
  | 'confirmed'
  | 'held'
  | 'waitlisted'
  | 'payment_received'
  | 'payment_not_verified'
  | 'place_offered'
  | 'cancelled'
  | 'hold_expired'
  | 'reminder'
  | 'workshop_cancelled'
  | 'booking_link'
  | 'interested'

export type TeamTemplate = 'team_registration' | 'team_payment' | 'team_cancelled'

export interface EmailContext {
  reg: Registration
  site: string
  settings: Settings
  /** the team's reason, for a rejected payment or a cancellation */
  note?: string
  /** people waiting, for the team's cancellation alert */
  waitlist?: number
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

interface Parts {
  subject: string
  eyebrow: string
  heading: string
  paragraphs: string[]
  facts?: [string, string][]
  button?: { label: string; url: string }
  after?: string[]
  list?: { title: string; items: string[] }[]
}

const TERRACOTTA = '#9f5738'
const INK = '#2b2620'
const MUTED = '#5b5248'

const bookingUrl = (c: EmailContext) => `${c.site}/booking/${c.reg.token}`
const workshopUrl = (c: EmailContext) => `${c.site}/workshops/${c.reg.workshop.slug}`

function workshopFacts(c: EmailContext): [string, string][] {
  const w = c.reg.workshop
  return [
    ['Workshop', w.title],
    ['Dates', dateRange(w.starts_on, w.ends_on)],
    ...(timings(w.daily_start, w.daily_end) ? [['Timings', timings(w.daily_start, w.daily_end)] as [string, string]] : []),
    ['Venue', place(w)],
    ['Fee', feeLabel(w)],
  ]
}

function paymentFacts(c: EmailContext): [string, string][] {
  return [
    ['Amount', rupees(c.reg.amount_inr)],
    ['Pay to (UPI)', c.settings.upi_id],
    ['Name', c.settings.payee_name],
    ['Pay by', moment(c.reg.hold_until)],
  ]
}

const CAMPUS = 'Kanha Shanti Vanam is a substance-free campus: no alcohol, smoking or tobacco.'

function participantParts(t: ParticipantTemplate, c: EmailContext): Parts {
  const { reg } = c
  const w = reg.workshop
  const hi = `Dear ${firstName(reg.name)},`
  const paid = reg.amount_inr > 0
  const stay = reg.needs_stay ? ['You asked for help with a stay at Kanha. Our team will be in touch about it.'] : []

  switch (t) {
    case 'confirmed':
      return {
        subject: `You're in: ${w.title}`,
        eyebrow: 'Place confirmed',
        heading: `See you at Kanha, ${firstName(reg.name)}`,
        paragraphs: [hi, `Your place on ${w.title} is confirmed. A calendar invite is attached.`, ...stay],
        facts: workshopFacts(c),
        button: { label: 'View your booking', url: bookingUrl(c) },
        after: ['We will send a reminder with the practical details two days before the workshop.', CAMPUS],
      }
    case 'held':
      return {
        subject: `Your place is held: ${w.title}`,
        eyebrow: 'Place held',
        heading: `Your place is held until ${moment(reg.hold_until)}`,
        paragraphs: [
          hi,
          `Thank you for registering for ${w.title}. To confirm your place, pay ${rupees(reg.amount_inr)} by UPI, then enter the payment reference (UTR) on your booking page.`,
        ],
        facts: paymentFacts(c),
        button: { label: 'Pay and confirm', url: bookingUrl(c) },
        after: ['If the payment is not received by then, the place is released to the next person waiting.'],
      }
    case 'waitlisted':
      return {
        subject: `You're on the waitlist: ${w.title}`,
        eyebrow: 'Waitlist',
        heading: `You're number ${reg.waitlist_position ?? ''} on the waitlist`,
        paragraphs: [
          hi,
          `${w.title} is full right now. If a place opens up, we will email you straight away${paid ? ' with a few hours to take it' : ''}.`,
        ],
        facts: workshopFacts(c),
        button: { label: 'View your booking', url: bookingUrl(c) },
      }
    case 'payment_received':
      return {
        subject: `Payment received: ${w.title}`,
        eyebrow: 'Payment received',
        heading: "Thank you. We're checking your payment",
        paragraphs: [
          hi,
          `We have your payment reference ${reg.payment_reference ?? ''}. We will confirm your place by email once it is matched, usually within a day.`,
        ],
        facts: workshopFacts(c),
        button: { label: 'View your booking', url: bookingUrl(c) },
      }
    case 'payment_not_verified':
      return {
        subject: `We couldn't match your payment: ${w.title}`,
        eyebrow: 'Payment not matched',
        heading: "We couldn't match your payment",
        paragraphs: [
          hi,
          `We could not find a payment for the reference you sent${c.note ? `: ${c.note}` : '.'}`,
          `Your place is held again until ${moment(reg.hold_until)}. Please check the reference in your UPI app and send it again, or pay if you haven't yet.`,
        ],
        facts: paymentFacts(c),
        button: { label: 'Open your booking', url: bookingUrl(c) },
      }
    case 'place_offered':
      return {
        subject: `A place has opened up: ${w.title}`,
        eyebrow: 'Good news',
        heading: 'A place has opened up for you',
        paragraphs: [
          hi,
          paid
            ? `A place on ${w.title} is now yours if you want it. Pay ${rupees(reg.amount_inr)} by ${moment(reg.hold_until)} to confirm it.`
            : `A place on ${w.title} is now yours if you want it. Please confirm by ${moment(reg.hold_until)}.`,
        ],
        facts: paid ? paymentFacts(c) : workshopFacts(c),
        button: { label: paid ? 'Pay and confirm' : 'Confirm my place', url: bookingUrl(c) },
        after: ['If you can no longer come, you can release the place from the same page.'],
      }
    case 'cancelled':
      return {
        subject: `Registration cancelled: ${w.title}`,
        eyebrow: 'Cancelled',
        heading: 'Your registration is cancelled',
        paragraphs: [
          hi,
          `Your registration for ${w.title} has been cancelled${c.note ? `: ${c.note}` : '.'}`,
          ...(paid && reg.payment_reference ? ['If you have already paid, our team will contact you about your payment.'] : []),
        ],
        button: { label: 'See upcoming workshops', url: `${c.site}/workshops` },
      }
    case 'hold_expired':
      return {
        subject: `Your hold has ended: ${w.title}`,
        eyebrow: 'Hold ended',
        heading: 'We could not keep your place',
        paragraphs: [
          hi,
          `Your place on ${w.title} was held until ${moment(reg.hold_until)}, and we did not receive a payment reference in time, so it has gone to the next person waiting.`,
          'If you did pay, reply to this email with your payment reference and we will sort it out.',
        ],
        button: { label: 'View the workshop', url: workshopUrl(c) },
      }
    case 'reminder': {
      const lists = [
        ...(w.provided.length ? [{ title: 'Provided for you', items: w.provided }] : []),
        ...(w.bring.length ? [{ title: 'Please bring', items: w.bring }] : []),
      ]
      return {
        subject: `See you soon: ${w.title}`,
        eyebrow: 'Reminder',
        heading: `${w.title} starts ${dateRange(w.starts_on, w.starts_on)}`,
        paragraphs: [hi, 'We are looking forward to building with you. Here is everything you need for the workshop.', ...stay],
        facts: workshopFacts(c),
        list: lists,
        button: { label: 'View your booking', url: bookingUrl(c) },
        after: [CAMPUS, ...(w.safety_note ? [w.safety_note] : [])],
      }
    }
    case 'workshop_cancelled':
      return {
        subject: `Workshop cancelled: ${w.title}`,
        eyebrow: 'Workshop cancelled',
        heading: `${w.title} has been cancelled`,
        paragraphs: [
          hi,
          `We are sorry: ${w.title}, planned for ${dateRange(w.starts_on, w.ends_on)}, will not go ahead.`,
          ...(paid && reg.payment_reference ? ['If you have paid, our team will contact you about a refund.'] : []),
        ],
        button: { label: 'See upcoming workshops', url: `${c.site}/workshops` },
      }
    case 'interested':
      return {
        subject: `You're on the list: ${w.title}`,
        eyebrow: 'Interest registered',
        heading: `Thank you, ${firstName(reg.name)}. You're on the list`,
        paragraphs: [
          hi,
          `Thank you for your interest in ${w.title}.`,
          'As soon as registration opens, we will email you and offer you a place, in the order people registered. There is nothing to pay now.',
          ...stay,
        ],
        facts: workshopFacts(c),
        button: { label: 'View your registration', url: bookingUrl(c) },
        after: [CAMPUS],
      }
    case 'booking_link':
      return {
        subject: `Your booking link: ${w.title}`,
        eyebrow: 'Your booking',
        heading: "You're already registered",
        paragraphs: [hi, `You are already registered for ${w.title} with this email address. Your booking page has all the details.`],
        button: { label: 'Open your booking', url: bookingUrl(c) },
      }
  }
}

function teamParts(t: TeamTemplate, c: EmailContext): Parts {
  const { reg } = c
  const w = reg.workshop
  const admin = `${c.site}/admin/workshops/${w.id}/participants`
  const person: [string, string][] = [
    ['Name', reg.name],
    ['Email', reg.email],
    ['Phone', reg.phone],
    ['City', reg.city],
    ['Background', reg.background === 'other' && reg.background_other ? reg.background_other : (BACKGROUNDS[reg.background] ?? reg.background)],
    ['Experience', EXPERIENCE[reg.experience] ?? reg.experience],
    ...(reg.needs_stay ? [['Stay', 'Needs help with a stay at Kanha'] as [string, string]] : []),
    ...(reg.food_needs ? [['Food', reg.food_needs] as [string, string]] : []),
  ]
  switch (t) {
    case 'team_registration':
      return {
        subject: `New registration (${reg.status}): ${reg.name} · ${w.title}`,
        eyebrow: 'New registration',
        heading: `${reg.name} registered`,
        paragraphs: [
          `${w.title}: ${w.seats_taken} of ${w.seats} places now in use${w.waitlist ? `, ${w.waitlist} on the waitlist` : ''}.`,
        ],
        facts: [['Status', reg.status], ...person],
        button: { label: 'Open in admin', url: admin },
      }
    case 'team_payment':
      return {
        subject: `Payment to check: ${rupees(reg.amount_inr)} from ${reg.name}`,
        eyebrow: 'Payment to check',
        heading: `${reg.name} has paid`,
        paragraphs: [`Please match this payment in your UPI account, then confirm or reject it in the admin.`],
        facts: [
          ['Reference', reg.payment_reference ?? ''],
          ['Amount', rupees(reg.amount_inr)],
          ['Workshop', w.title],
          ['Email', reg.email],
        ],
        button: { label: 'Check in admin', url: admin },
      }
    case 'team_cancelled':
      return {
        subject: `Cancelled: ${reg.name} · ${w.title}`,
        eyebrow: 'Cancellation',
        heading: `${reg.name} cancelled`,
        paragraphs: [
          c.waitlist
            ? `A place is free, and ${c.waitlist} ${c.waitlist === 1 ? 'person is' : 'people are'} on the waitlist. Offer it from the admin.`
            : 'A place is free again.',
        ],
        facts: [['Workshop', w.title], ['Email', reg.email]],
        button: { label: 'Open in admin', url: admin },
      }
  }
}

function render(p: Parts, site: string): RenderedEmail {
  const e = escapeHtml
  const para = (s: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${INK}">${e(s)}</p>`
  const facts = p.facts?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:6px 0 22px;border-collapse:collapse;background:#f6efe4;border-radius:10px">${p.facts
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 16px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};width:34%;vertical-align:top">${e(k)}</td><td style="padding:10px 16px;font-size:15px;color:${INK};font-weight:600">${e(v)}</td></tr>`,
        )
        .join('')}</table>`
    : ''
  const lists = (p.list ?? [])
    .map(
      (l) =>
        `<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${INK}">${e(l.title)}</p><ul style="margin:0 0 16px;padding-left:20px;color:${INK};font-size:14px;line-height:1.6">${l.items.map((i) => `<li>${e(i)}</li>`).join('')}</ul>`,
    )
    .join('')
  const button = p.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 22px"><tr><td style="background:${TERRACOTTA};border-radius:999px"><a href="${e(p.button.url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${e(p.button.label)}</a></td></tr></table>`
    : ''
  const after = (p.after ?? []).map((s) => `<p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:${MUTED}">${e(s)}</p>`).join('')

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(p.subject)}</title></head>
<body style="margin:0;padding:0;background:#f2ebe0;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2ebe0;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border-radius:16px;overflow:hidden">
<tr><td style="padding:24px 28px 18px;border-bottom:3px solid ${TERRACOTTA}">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td><img src="${e(site)}/favicon-192.png" width="64" height="64" alt="Heartisan Home" style="display:block"></td>
<td style="padding-left:14px;font-size:14px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${INK}">Heartisan Home<br><span style="font-size:12px;font-weight:400;letter-spacing:0;text-transform:none;color:${MUTED}">Building with Earth. Learning with the Heart.</span></td>
</tr></table></td></tr>
<tr><td style="padding:28px 28px 12px">
<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${TERRACOTTA}">${e(p.eyebrow)}</p>
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:400;color:${INK}">${e(p.heading)}</h1>
${p.paragraphs.map(para).join('')}${facts}${lists}${button}${after}
</td></tr>
<tr><td style="padding:18px 28px;background:#efe6d8;font-size:12px;line-height:1.6;color:${MUTED}">Heartisan Home · Kanha Shanti Vanam<br>Questions? Just reply to this email.</td></tr>
</table></td></tr></table></body></html>`

  const text = [
    p.heading,
    '',
    ...p.paragraphs.flatMap((s) => [s, '']),
    ...(p.facts?.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`) ?? []),
    ...(p.facts?.length ? [''] : []),
    ...(p.list ?? []).flatMap((l) => [l.title, ...l.items.map((i) => `- ${i}`), '']),
    ...(p.button ? [`${p.button.label}: ${p.button.url}`, ''] : []),
    ...(p.after ?? []).flatMap((s) => [s, '']),
    'Heartisan Home · Kanha Shanti Vanam',
  ].join('\n')

  return { subject: p.subject, html, text }
}

export const participantEmail = (t: ParticipantTemplate, c: EmailContext) => render(participantParts(t, c), c.site)
export const teamEmail = (t: TeamTemplate, c: EmailContext) => render(teamParts(t, c), c.site)
