import CraftCard from './CraftCard'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'
import { TECHNIQUES, type TechniqueId } from '../data/content'

// Crops keep each material in frame on both the near-square phone thumbnail and the 6:5 desktop card.
// The two block photos are studio shots on white: multiply blends that white into the card's cream.
const PHOTO: Record<TechniqueId, string> = {
  cseb: 'object-[45%_50%] mix-blend-multiply',
  limeCseb: 'object-[64%_50%] lg:object-[70%_50%] mix-blend-multiply',
  limeMortar: 'object-center',
  mudConcrete: 'object-[50%_70%]',
  limePlaster: 'object-[90%_45%]',
}

export default function CraftSection() {
  return (
    <section id="craft" className="moss relative z-10 pb-20 pt-14 text-paper lg:pb-28 lg:pt-20">
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
                <CraftCard
                  media={technique.id}
                  name={technique.name}
                  description={technique.description}
                  photoClassName={PHOTO[technique.id]}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
