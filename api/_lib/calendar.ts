import type { Workshop } from './types.js'

// Calendar entries for a workshop: an .ics file (attached to the confirmation email and offered on the booking page)
// and a Google Calendar link. With daily timings, one event repeats each day; without, it is an all-day event.

const IST_OFFSET_MIN = 330

const compact = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

// "2026-12-12" at "09:30:00" India time, as a UTC moment
function utc(date: string, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCMinutes(h * 60 + m - IST_OFFSET_MIN)
  return d
}

const plusDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

const days = (w: Workshop) =>
  Math.round((Date.parse(`${w.ends_on}T00:00:00Z`) - Date.parse(`${w.starts_on}T00:00:00Z`)) / 864e5) + 1

// "Kanha Shanti Vanam, Telangana", without repeating the venue when the address already names it
export function place(w: Pick<Workshop, 'venue' | 'venue_address'>): string {
  if (!w.venue_address) return w.venue
  return w.venue_address.includes(w.venue) ? w.venue_address : `${w.venue}, ${w.venue_address}`
}

function slots(w: Workshop): { start: string; end: string; allDay: boolean } | null {
  if (!w.starts_on || !w.ends_on) return null
  if (w.daily_start && w.daily_end) {
    return { start: compact(utc(w.starts_on, w.daily_start)), end: compact(utc(w.starts_on, w.daily_end)), allDay: false }
  }
  return { start: w.starts_on.replace(/-/g, ''), end: plusDays(w.ends_on, 1).replace(/-/g, ''), allDay: true }
}

const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

// Lines longer than 75 bytes are folded, as the format requires.
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const out: string[] = []
  let current = ''
  for (const ch of line) {
    if (new TextEncoder().encode(current + ch).length > (out.length ? 74 : 75)) {
      out.push(current)
      current = ch
    } else current += ch
  }
  out.push(current)
  return out.join('\r\n ')
}

export function ics(w: Workshop, uid: string, bookingUrl: string): string | null {
  const s = slots(w)
  if (!s) return null
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Heartisan Home//Workshops//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@heartisanhome.com`,
    `DTSTAMP:${compact(new Date())}`,
    s.allDay ? `DTSTART;VALUE=DATE:${s.start}` : `DTSTART:${s.start}`,
    s.allDay ? `DTEND;VALUE=DATE:${s.end}` : `DTEND:${s.end}`,
    ...(s.allDay || days(w) === 1 ? [] : [`RRULE:FREQ=DAILY;COUNT=${days(w)}`]),
    `SUMMARY:${escapeIcs(`${w.title} · Heartisan Home`)}`,
    `LOCATION:${escapeIcs(place(w))}`,
    `DESCRIPTION:${escapeIcs(`Your booking: ${bookingUrl}`)}`,
    `URL:${bookingUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function googleCalendarUrl(w: Workshop, bookingUrl: string): string | null {
  const s = slots(w)
  if (!s) return null
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${w.title} · Heartisan Home`,
    dates: `${s.start}/${s.end}`,
    location: place(w),
    details: `Your booking: ${bookingUrl}`,
  })
  if (!s.allDay && days(w) > 1) q.set('recur', `RRULE:FREQ=DAILY;COUNT=${days(w)}`)
  return `https://calendar.google.com/calendar/render?${q}`
}
