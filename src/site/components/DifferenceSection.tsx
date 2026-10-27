import LineIcon from './lineIcons'
import Reveal from './Reveal'
import { PILLARS } from '../data/content'

export default function DifferenceSection() {
  return (
    <section id="difference" className="paper relative overflow-hidden pb-20 pt-10 lg:pb-28 lg:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(45%_55%_at_92%_45%,rgb(255_255_255/0.55),transparent_70%)] lg:block"
      />

      <div className="container-site relative">
        <Reveal>
          <p className="eyebrow max-w-[16rem] leading-[1.9] text-muted md:max-w-none">The Heartisan Home Difference</p>
          <h2 className="heading mt-4 text-ink">
            A Different <br className="md:hidden" />
            Place to Learn.
            <br />
            A Different <br className="md:hidden" />
            Way to Build.
          </h2>
        </Reveal>

        <ul className="mt-10 grid gap-9 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:mt-14 lg:grid-cols-4 lg:gap-0">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.title} className={index > 0 ? 'lg:border-l lg:border-stone/70' : ''}>
              <Reveal delay={index * 90} className={`flex gap-5 lg:block ${index === 0 ? 'lg:pr-8' : 'lg:px-8'}`}>
                <span className="flex h-[5.25rem] w-[5.25rem] shrink-0 items-center justify-center rounded-full bg-tan lg:h-auto lg:w-auto lg:justify-start lg:bg-transparent">
                  <LineIcon name={pillar.icon} className="h-11 w-11 text-terracotta lg:h-14 lg:w-14" />
                </span>
                <div className="pt-1 lg:pt-0">
                  <h3 className="text-[0.95rem] font-bold uppercase tracking-[0.08em] text-ink lg:mt-6">{pillar.title}</h3>
                  <p className="mt-2 max-w-[17rem] text-[1rem] leading-relaxed text-muted lg:mt-3 lg:text-sm">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
