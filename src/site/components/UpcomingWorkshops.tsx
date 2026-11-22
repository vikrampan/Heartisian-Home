import { useEffect, useState } from 'react'
import TicketCard from '../../workshops/TicketCard'
import type { Workshop } from '../../workshops/lib'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

// The next workshops, between the craft and the film. Hidden until there is at least one to show.
export default function UpcomingWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])

  useEffect(() => {
    let live = true
    fetch('/api/workshops')
      .then((res) => (res.ok && res.headers.get('content-type')?.includes('json') ? (res.json() as Promise<Workshop[]>) : []))
      .then((list) => live && Array.isArray(list) && setWorkshops(list.slice(0, 2)))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  return (
    <section id="workshops" aria-label="Upcoming workshops" className={workshops.length ? 'paper relative z-10 py-16 lg:py-24' : 'hidden'}>
      <div className="container-site">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <SectionIntro eyebrow="Workshops" title="Learn it with your own hands" />
          <a href="/workshops" className="text-[0.9375rem] font-semibold text-terracotta underline-offset-4 hover:underline">
            All workshops
          </a>
        </Reveal>
        <div className="mt-10 space-y-8">
          {workshops.map((w, i) => (
            <Reveal key={w.id} delay={i * 120}>
              <TicketCard w={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
