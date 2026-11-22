import type { Registration, Workshop } from '../lib'
import { BUTTON } from '../ui'
import { admin } from './session'

// Shared by the admin screens: button styles, status names and small helpers.

export type AdminWorkshop = Workshop & { counts: Partial<Record<Registration['status'], number>>; checked_in: number }

export const BTN = `${BUTTON} h-10 px-4 text-sm`
export const BTN_PRIMARY = `${BTN} bg-terracotta text-white hover:bg-[#84452b]`
export const BTN_DARK = `${BTN} bg-moss text-paper hover:bg-moss-deep`
export const BTN_PLAIN = `${BTN} border border-ink/20 bg-white text-ink hover:border-ink/50`
export const BTN_DANGER = `${BTN} border border-[#b4432f]/40 bg-white text-[#a13a28] hover:bg-[#a13a28] hover:text-white`

export const REG_STATUS: Record<Registration['status'], [string, string]> = {
  confirmed: ['Confirmed', 'bg-[#e1e6cc] text-[#46542a]'],
  held: ['Awaiting payment', 'bg-terracotta/12 text-terracotta'],
  verifying: ['Payment to check', 'bg-[#fbe2bd] text-[#7f4b00]'],
  waitlisted: ['Waitlist', 'bg-coast/15 text-coast'],
  cancelled: ['Cancelled', 'bg-ink/8 text-muted'],
  expired: ['Hold ended', 'bg-ink/8 text-muted'],
}

export const regLabel = (r: Pick<Registration, 'status' | 'amount_inr'>) =>
  r.status === 'held' && !r.amount_inr ? 'Place offered' : REG_STATUS[r.status][0]

export const WS_STATUS: Record<Workshop['status'], [string, string]> = {
  draft: ['Draft', 'bg-ink/8 text-muted'],
  published: ['Published', 'bg-[#e1e6cc] text-[#46542a]'],
  closed: ['Registration closed', 'bg-coast/15 text-coast'],
  cancelled: ['Cancelled', 'bg-[#f3d6cf] text-[#a13a28]'],
}

/** "2 h ago", "3 days ago" */
export function ago(iso: string | null) {
  if (!iso) return ''
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`
  const days = Math.round(mins / 1440)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

// What each status can move to, with the button's wording and a confirmation where it matters.
export const STATUS_MOVES: Record<Workshop['status'], { to: Workshop['status']; label: string; confirm?: string }[]> = {
  draft: [{ to: 'published', label: 'Publish' }],
  published: [
    { to: 'closed', label: 'Close registration' },
    { to: 'draft', label: 'Unpublish', confirm: 'Take this workshop off the website? People already registered keep their places.' },
    { to: 'cancelled', label: 'Cancel workshop', confirm: 'Cancel this workshop? Everyone registered or waiting is emailed that it is cancelled. This cannot be undone.' },
  ],
  closed: [
    { to: 'published', label: 'Reopen registration' },
    { to: 'cancelled', label: 'Cancel workshop', confirm: 'Cancel this workshop? Everyone registered or waiting is emailed that it is cancelled. This cannot be undone.' },
  ],
  cancelled: [{ to: 'draft', label: 'Move back to draft' }],
}

export async function moveStatus(w: Workshop, to: Workshop['status'], confirmText?: string) {
  if (confirmText && !window.confirm(confirmText)) return null
  return admin<{ workshop: AdminWorkshop; emailed: number }>('workshop_status', { id: w.id, status: to })
}

