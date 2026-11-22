import { rupees, type Workshop } from './lib'

// Small helpers shared by the workshop pages and the admin.

const day = (iso: string) => new Date(`${iso}T12:00:00Z`)
const part = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...o }).format(day(iso))

/** The ticket stub: "16–17", "December 2026", "Wed – Thu" */
export function dateParts(starts: string | null, ends: string | null) {
  if (!starts) return { days: 'TBA', month: 'Dates soon', weekdays: '' }
  const end = ends ?? starts
  const sameMonth = starts.slice(0, 7) === end.slice(0, 7)
  const d = (iso: string) => part(iso, { day: 'numeric' })
  const wd = (iso: string) => part(iso, { weekday: 'short' })
  return {
    days: starts === end ? d(starts) : sameMonth ? `${d(starts)}–${d(end)}` : `${d(starts)} ${part(starts, { month: 'short' })}–${d(end)} ${part(end, { month: 'short' })}`,
    month: sameMonth ? part(starts, { month: 'long', year: 'numeric' }) : part(end, { year: 'numeric' }),
    weekdays: starts === end ? wd(starts) : `${wd(starts)} – ${wd(end)}`,
  }
}

export function availability(w: Workshop) {
  if (w.status === 'closed' || !w.registration_open) return { label: 'Registration closed', tone: 'bg-ink/10 text-ink' }
  if (w.interest_only) return { label: 'Registering interest', tone: 'bg-ochre-soft text-[#7a5212]' }
  return { label: 'Registration open', tone: 'bg-sage-soft text-[#3f5a3b]' }
}

export function callToAction(w: Workshop) {
  if (!w.registration_open) return { label: 'Registration closed', note: 'Registration for this workshop has closed.' }
  if (w.interest_only) {
    const missing = w.dates_tba && w.fee_tba ? 'The dates and fee are being finalised. ' : w.dates_tba ? 'The dates are being finalised. ' : w.fee_tba ? 'The fee is being finalised. ' : ''
    return {
      label: 'Register your interest',
      note: `${missing}Register now with nothing to pay, and we'll invite you to book as soon as registration opens.`,
    }
  }
  if (w.seats_left === 0) return { label: 'Join the waitlist', note: 'All places are taken. We will email you if one opens up.' }
  if (!w.fee_inr) return { label: 'Register for free', note: 'Free · your place is confirmed straight away.' }
  return {
    label: 'Reserve my place',
    note: `${rupees(w.fee_inr)} · we hold your place for ${w.hold_hours_effective} hours while you pay by UPI.`,
  }
}

/** The short code people add to their UPI payment, so the team can match it: "HH-096553" */
export const paymentCode = (token: string) => `HH-${token.slice(0, 6).toUpperCase()}`


/** Whole days from today (local) until an ISO date: 0 today, 1 tomorrow, negative once past. */
export function daysUntil(iso: string | null) {
  if (!iso) return null
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - today) / 864e5)
}

export const dayCount = (w: Pick<Workshop, 'starts_on' | 'ends_on'>) =>
  w.starts_on && w.ends_on ? Math.round((Date.parse(`${w.ends_on}T00:00:00Z`) - Date.parse(`${w.starts_on}T00:00:00Z`)) / 864e5) + 1 : null

/** "Starts in 55 days", "Starts tomorrow", "Starts today" */
export function startsIn(w: Pick<Workshop, 'starts_on'>) {
  const n = daysUntil(w.starts_on)
  if (n === null || n < 0) return ''
  if (n === 0) return 'Starts today'
  if (n === 1) return 'Starts tomorrow'
  if (n < 60) return `Starts in ${n} days`
  return `Starts in ${Math.round(n / 7)} weeks`
}

/** How booking works, step by step, for this workshop's mode. */
export function bookingSteps(w: Workshop): { title: string; text: string }[] {
  if (w.interest_only) {
    return [
      { title: 'Register your interest', text: 'A two-minute form. Nothing to pay.' },
      { title: 'We announce the details', text: 'You hear first when the dates and fee are fixed.' },
      { title: 'You book your place', text: 'You are invited to book before anyone else.' },
    ]
  }
  if (!w.fee_inr) {
    return [
      { title: 'Register', text: 'A two-minute form.' },
      { title: 'Confirmed instantly', text: 'Your confirmation and calendar invite arrive by email.' },
      { title: 'See you at Kanha', text: 'A reminder with practical details comes two days before.' },
    ]
  }
  return [
    { title: 'Reserve your place', text: 'A two-minute form. Nothing to pay yet.' },
    { title: `Pay within ${w.hold_hours_effective} hours`, text: 'Scan the UPI QR on your booking page and send us the reference.' },
    { title: "You're confirmed", text: 'We check the payment and email your confirmation and calendar invite.' },
  ]
}
