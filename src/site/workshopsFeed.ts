import { useEffect, useState } from 'react'
import type { Workshop } from '../workshops/lib'

// The upcoming workshops, fetched once per visit and shared by the menu tag and the home-page strip.
let feed: Promise<Workshop[]> | null = null

export function loadWorkshops(): Promise<Workshop[]> {
  feed ??= fetch('/api/workshops')
    .then((res) => (res.ok && res.headers.get('content-type')?.includes('json') ? (res.json() as Promise<Workshop[]>) : []))
    .then((list) => (Array.isArray(list) ? list : []))
    .catch(() => [])
  return feed
}

export function useWorkshops() {
  const [list, setList] = useState<Workshop[]>([])
  useEffect(() => {
    let live = true
    loadWorkshops().then((l) => live && setList(l))
    return () => {
      live = false
    }
  }, [])
  return list
}

/** True while at least one workshop is taking registrations. */
export const useRegistrationOpen = () => useWorkshops().some((w) => w.registration_open)
