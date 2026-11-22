// The shapes the database functions return (supabase/migrations). Only the fields the server reads are listed.

export interface Trainer {
  id: string
  slug: string
  name: string
  title: string
  experience: string
  bio: string
  expertise: string[]
  photo_url: string | null
}

export interface Session {
  title: string
  content: string
  method: string
}

export interface Day {
  /** shown instead of "Day 1", e.g. "Modules 1–5" */
  label?: string
  title: string
  sessions: Session[]
  outputs: string[]
}

export interface Workshop {
  id: string
  slug: string
  status: 'draft' | 'published' | 'closed' | 'cancelled'
  title: string
  subtitle: string
  summary: string
  starts_on: string | null
  ends_on: string | null
  daily_start: string | null
  daily_end: string | null
  venue: string
  venue_address: string
  seats: number
  seats_taken: number
  seats_left: number
  waitlist: number
  fee_inr: number
  /** the fee is shown as "to be announced" */
  fee_tba: boolean
  /** no dates yet: people register interest */
  dates_tba: boolean
  /** dates or fee not fixed yet: people register interest */
  interest_only: boolean
  hold_hours: number | null
  provided: string[]
  bring: string[]
  safety_note: string
  schedule: Day[]
  trainers: Trainer[]
}

export type Status = 'held' | 'verifying' | 'confirmed' | 'waitlisted' | 'interested' | 'cancelled' | 'expired'

export interface Registration {
  id: string
  token: string
  status: Status
  name: string
  email: string
  phone: string
  city: string
  background: string
  background_other: string
  experience: string
  organisation: string
  motivation: string
  heard_from: string
  needs_stay: boolean
  food_needs: string
  emergency_name: string
  emergency_phone: string
  photo_consent: boolean
  amount_inr: number
  payment_reference: string | null
  hold_until: string | null
  cancel_reason: string | null
  waitlist_position: number | null
  created_at: string
  workshop: Workshop
}

export interface Settings {
  upi_id: string
  payee_name: string
  upi_qr_url: string
  team_email: string
  reply_to: string
  default_hold_hours: number
}
