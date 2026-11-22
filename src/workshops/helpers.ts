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
  if (w.interest_only) return { label: 'Registering interest', tone: 'bg-clay/25 text-[#7a4a26]' }
  if (w.seats_left === 0) return { label: 'Full · waitlist open', tone: 'bg-coast/15 text-coast' }
  if (w.seats_left <= 5) return { label: `Only ${w.seats_left} ${w.seats_left === 1 ? 'place' : 'places'} left`, tone: 'bg-terracotta/12 text-terracotta' }
  return { label: 'Open for registration', tone: 'bg-olive/20 text-[#5f5838]' }
}

export function callToAction(w: Workshop) {
  if (!w.registration_open) return { label: 'Registration closed', note: 'Registration for this workshop has closed.' }
  if (w.interest_only) {
    const missing = w.dates_tba && w.fee_tba ? 'The dates and fee are being finalised. ' : w.dates_tba ? 'The dates are being finalised. ' : w.fee_tba ? 'The fee is being finalised. ' : ''
    return {
      label: 'Register your interest',
      note: `${missing}Register now with nothing to pay: we'll email you and offer you a place, in the order people register.`,
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

