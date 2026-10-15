import Button from './Button'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'
import { ScaleDiagramDesktop, ScaleDiagramMobile } from './ScaleDiagram'

export default function JourneySection() {
  return (
    <section id="journey" className="paper relative pb-20 pt-16 lg:py-24">
      <div className="container-site grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        <Reveal>
          <SectionIntro
            eyebrow="From Learning to Scale"
            title={
              <>
                Building a <br className="lg:hidden" />
                Sustainable <br className="hidden lg:inline" />
                Future at Scale
              </>
            }
          />
          <p className="mt-5 max-w-[32rem] text-[1.0625rem] leading-relaxed text-muted lg:text-base">
            The experience and knowledge developed through Heartisan Home can contribute to a larger movement towards
            natural and sustainable construction. Shanti Kunj Infrastructure Limited (SKIL) is the community
            construction initiative working to take these approaches forward into larger-scale construction and
            infrastructure.
          </p>
          <Button
            href="#build"
            variant="outline"
            className="mt-8 hidden h-11 rounded-sm px-6 lg:inline-flex"
          >
            The Larger Journey
          </Button>
        </Reveal>

        <Reveal delay={150}>
          <ScaleDiagramDesktop />
          <ScaleDiagramMobile />
        </Reveal>

        <Button
          href="#build"
          variant="outline"
          className="h-16 w-full max-w-[16.5rem] justify-between! rounded-full px-8 lg:hidden"
        >
          The Larger Journey
        </Button>
      </div>
    </section>
  )
}
