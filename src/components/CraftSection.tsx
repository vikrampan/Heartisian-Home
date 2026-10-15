import CraftCard from './CraftCard'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'
import TornEdge from './TornEdge'
import { TECHNIQUES } from '../data/content'

export default function CraftSection() {
  return (
    <section id="craft" className="moss relative z-10 pb-20 pt-14 text-paper lg:pb-28 lg:pt-20">
      <TornEdge className="text-moss" rimClassName="text-[#4b4f3b]" />

      <div className="container-site">
        <Reveal>
          <SectionIntro tone="light" eyebrow="The Craft" title="Earth. Lime. People." />
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-paper/85">
            Time-tested materials. <br className="lg:hidden" />
            Contemporary possibilities.
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-3.5 lg:mt-12 lg:grid-cols-5 lg:gap-5">
          {TECHNIQUES.map((technique, index) => (
            <li key={technique.id}>
              <Reveal delay={index * 80} className="h-full">
                <CraftCard media={technique.id} name={technique.name} description={technique.description} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
