// Dates, times and money as people in India read them. Every workshop runs on India time.

const TZ = 'Asia/Kolkata'

// A calendar date ("2026-12-12") as a Date at midday UTC, so formatting can't shift it to a neighbouring day.
const day = (iso: string) => new Date(`${iso}T12:00:00Z`)

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...options })

/** "Sat 12 – Sun 13 December 2026", "Sat 12 December 2026", or "Fri 30 January – Sun 1 February 2026" */
export function dateRange(starts: string | null, ends: string | null): string {
  if (!starts) return 'Dates to be announced'
  const bits = (iso: string) => {
    const d = day(iso)
    return { wd: fmt({ weekday: 'short' }).format(d), dd: d.getUTCDate(), mon: fmt({ month: 'long' }).format(d), yr: d.getUTCFullYear() }
  }
  const a = bits(starts)
  const b = bits(ends ?? starts)
  const end = `${b.wd} ${b.dd} ${b.mon} ${b.yr}`
  if (starts === (ends ?? starts)) return end
  if (a.mon === b.mon && a.yr === b.yr) return `${a.wd} ${a.dd} – ${end}`
  if (a.yr === b.yr) return `${a.wd} ${a.dd} ${a.mon} – ${end}`
  return `${a.wd} ${a.dd} ${a.mon} ${a.yr} – ${end}`
}

/** "09:30:00" → "9:30 am" */
export function clock(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`
}

export function timings(start: string | null, end: string | null): string {
  if (!start || !end) return ''
  return `${clock(start)} – ${clock(end)} each day`
}

/** A moment, in India time: "Sat 14 Dec, 6:30 pm" */
export function moment(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(new Date(iso))
    .replace(/\b(am|pm)\b/i, (x) => x.toLowerCase())
}

export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

/** "₹3,500", "Free" or "Fee to be announced" */
export const feeLabel = (w: { fee_inr: number; fee_tba: boolean }) =>
  w.fee_tba ? 'Fee to be announced' : w.fee_inr ? rupees(w.fee_inr) : 'Free'

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}

export const BACKGROUNDS: Record<string, string> = {
  student: 'Student',
  mason: 'Mason or builder',
  architect_engineer: 'Architect or engineer',
  homeowner: 'Homeowner or self-builder',
  entrepreneur: 'Entrepreneur',
  other: 'Other',
}

export const EXPERIENCE: Record<string, string> = {
  none: 'New to building',
  some: 'Some hands-on experience',
  professional: 'Work in construction',
}
