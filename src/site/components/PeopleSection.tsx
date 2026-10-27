import Photo from './Photo'
import Reveal from './Reveal'
import { PEOPLE_CARDS } from '../data/content'

// Card shapes follow the photos. The team photo is a wide 16:9 group shot, so its card never gets
// narrower than about 1.28:1 (narrower cuts people off at the edges); the other two photos are portrait.
// Desktop: one row, with the team card wider. Tablet: team card on top, the other two below.
const LAYOUT = {
  people: {
    card: 'aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] xl:aspect-auto xl:h-full',
    item: 'md:col-span-2 xl:col-span-1',
    photo: 'object-[45%_50%]',
    sizes: '(min-width: 1280px) 500px, (min-width: 768px) calc(100vw - 5rem), 100vw',
  },
  places: {
    card: 'aspect-[4/5]',
    item: '',
    photo: 'object-[50%_62%]',
    sizes: '(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw',
  },
  purpose: {
    card: 'aspect-[4/5]',
    item: '',
    photo: 'object-[50%_35%]',
    sizes: '(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw',
  },
} as const

export default function PeopleSection() {
  return (
    <section id="people" aria-labelledby="people-title" className="paper relative pb-20 pt-6 lg:pb-28 lg:pt-10">
      <div className="container-site">
        <Reveal>
          <h2 id="people-title" className="eyebrow flex items-center gap-4 text-muted lg:justify-center">
            <span aria-hidden="true" className="hidden h-px w-12 bg-current opacity-40 lg:block" />
            <span>
              People <span aria-hidden="true">·</span> Places <span aria-hidden="true">·</span> Purpose
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-current opacity-30 lg:w-12 lg:flex-none lg:opacity-40" />
          </h2>
        </Reveal>

        <ul className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6 lg:mt-10 xl:grid-cols-[1.6fr_1fr_1fr]">
          {PEOPLE_CARDS.map((card, index) => {
            const layout = LAYOUT[card.id]
            return (
              <li key={card.id} className={layout.item}>
                <Reveal delay={index * 90} className="h-full">
                  <figure
                    className={`group relative isolate m-0 flex items-end overflow-hidden rounded-xl p-6 text-paper shadow-[0_18px_40px_-26px_rgb(43_38_32/0.7)] ring-1 ring-inset ring-white/10 lg:p-8 ${layout.card}`}
                  >
                    <Photo
                      media={card.id}
                      sizes={layout.sizes}
                      labelPosition="top-right"
                      className={`absolute inset-0 -z-10 h-full w-full transition-transform duration-[1.6s] ease-[var(--ease-soft)] group-hover:scale-[1.03] ${layout.photo}`}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_42%,rgb(18_13_9/0.5)_68%,rgb(18_13_9/0.86)_100%)]"
                    />
                    {/* soft halo: keeps the lettering crisp where it crosses light clothing or sunlit floor */}
                    <figcaption className="[text-shadow:0_1px_2px_rgb(18_13_9/0.45),0_2px_16px_rgb(18_13_9/0.45)]">
                      <span className="block font-display text-[2.1rem] leading-tight lg:text-[2.5rem]">{card.title}</span>
                      <span className="mt-1 block max-w-[16rem] text-[1.0625rem] leading-snug text-paper/90">
                        {card.subtitle}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
