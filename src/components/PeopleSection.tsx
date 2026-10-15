import Photo from './Photo'
import Reveal from './Reveal'
import { IconArrow } from './icons'
import { PEOPLE_CARDS } from '../data/content'

export default function PeopleSection() {
  return (
    <section id="people" aria-labelledby="people-title" className="paper relative pb-20 pt-6 lg:pb-28 lg:pt-10">
      <div className="container-site">
        <Reveal>
          <h2 id="people-title" className="eyebrow text-muted lg:text-center">
            People <span aria-hidden="true">·</span> Places <span aria-hidden="true">·</span> Purpose
          </h2>
        </Reveal>

        <ul className="mt-6 grid gap-3.5 lg:mt-10 lg:grid-cols-3 lg:gap-6">
          {PEOPLE_CARDS.map((card, index) => (
            <li key={card.id}>
              <Reveal delay={index * 90}>
                <a
                  href={card.href}
                  className="group relative isolate flex aspect-[7/6] items-end overflow-hidden rounded-lg p-6 text-paper lg:aspect-[4/5] lg:p-8"
                >
                  <Photo
                    media={card.id}
                    labelPosition="top-right"
                    className="absolute inset-0 -z-10 h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-soft)] group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_35%,rgb(18_13_9/0.78)_100%)]"
                  />
                  <span className="flex w-full items-end justify-between gap-4">
                    <span>
                      <span className="block font-display text-[2.1rem] leading-tight lg:text-[2.5rem]">{card.title}</span>
                      <span className="mt-1 block max-w-[13rem] text-[1.0625rem] leading-snug text-paper/90">
                        {card.subtitle}
                      </span>
                    </span>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-paper/80 transition-colors duration-300 group-hover:bg-paper group-hover:text-ink">
                      <IconArrow className="h-5 w-5" />
                    </span>
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
