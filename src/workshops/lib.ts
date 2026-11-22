import { useEffect, useState, useSyncExternalStore, type MouseEvent } from 'react'
import type { Registration as ServerRegistration, Workshop as ServerWorkshop } from '../../api/_lib/types.js'

// Shared by the workshop pages and the admin: the data shapes, calls to /api, and a very small router.
// The formatting and calendar helpers are the same files the server uses for emails.
export { dateRange, clock, timings, moment, rupees, feeLabel, firstName, BACKGROUNDS, EXPERIENCE } from '../../api/_lib/format.js'
export { place } from '../../api/_lib/calendar.js'
export type { Trainer, Day, Session, Status, Settings } from '../../api/_lib/types.js'

export interface Workshop extends ServerWorkshop {
  level: string
  format: string
  outcomes: string[]
  registration_closes_at: string | null
  closes_at: string | null
  /** hours an unpaid place is kept, with the default from settings applied */
  hold_hours_effective: number
  published_at: string | null
  created_at: string
}

export interface Registration extends Omit<ServerRegistration, 'workshop'> {
  workshop: Workshop
  workshop_id: string
  payment_submitted_at: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  checked_in_at: string | null
  reminder_sent_at: string | null
  age_confirmed: boolean
  rules_agreed: boolean
  safety_agreed: boolean
  admin_note?: string
  updated_at: string
}

export interface BookingView {
  registration: Registration
  payment: { upi_id: string; payee_name: string; qr_url: string | null }
  contact_email: string | null
  calendar: string | null
}

// ---- calls to /api ----

export class ApiError extends Error {
  status: number
  fields: Record<string, string>
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api/${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError('We could not reach the server. Please check your connection and try again.', 0)
  }
  // anything but JSON (e.g. a hosting error page) means the workshop service isn't answering properly
  if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
    throw new ApiError('Workshops are not available right now. Please try again a little later.', res.status || 503)
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; fields?: Record<string, string> }
  if (!res.ok) throw new ApiError(data.error ?? 'Something went wrong. Please try again.', res.status, data.fields)
  return data
}

export const post = <T>(path: string, body: unknown, headers?: Record<string, string>) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body), headers })

/** Loads once per key; `reload` fetches again. */
export function useLoad<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = useState<{ key: string | null; data?: T; error?: ApiError }>({ key: null })
  const [version, setVersion] = useState(0)
  useEffect(() => {
    if (key === null) return
    let live = true
    load().then(
      (data) => live && setState({ key, data }),
      (error: ApiError) => live && setState({ key, error }),
    )
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` says when to load again
  }, [key, version])
  const current = state.key === key
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: key !== null && !current,
    reload: () => setVersion((v) => v + 1),
    set: (data: T) => setState({ key, data }),
  }
}

// ---- router: the workshop pages, booking pages and admin share one page load ----

const listeners = new Set<() => void>()
// set once the workshop pages are running; elsewhere (the home page) links load normally
let active = false
export const activateRouter = () => {
  active = true
}
const notify = () => listeners.forEach((l) => l())
if (typeof window !== 'undefined') window.addEventListener('popstate', notify)

export function navigate(to: string, { replace = false } = {}) {
  const url = new URL(to, window.location.href)
  // the home page is a different app; load it fully
  if (!/^\/(workshops|booking|admin)(\/|$)/.test(url.pathname)) {
    window.location.href = url.href
    return
  }
  if (replace) window.history.replaceState(null, '', url)
  else window.history.pushState(null, '', url)
  if (!url.hash) window.scrollTo({ top: 0, behavior: 'instant' })
  notify()
}

export function useLocation() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => window.location.pathname + window.location.search,
  )
}

/** Plain links that move between these pages without reloading. */
export function onLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  const a = event.currentTarget
  if (!active || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || a.target) return
  const url = new URL(a.href)
  if (url.origin !== window.location.origin || !/^\/(workshops|booking|admin)(\/|$)/.test(url.pathname)) return
  event.preventDefault()
  navigate(url.pathname + url.search + url.hash)
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}

// ---- small helpers ----

export const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** "with Francois, Girish & Dil" */
export function trainerNames(names: string[]) {
  const first = names.map((n) => n.replace(/\s*\(.*?\)/, '').split(' ')[0])
  if (first.length <= 1) return first.join('')
  return `${first.slice(0, -1).join(', ')} & ${first[first.length - 1]}`
}

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
