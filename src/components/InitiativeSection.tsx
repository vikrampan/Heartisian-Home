import Button from './Button'
import Photo from './Photo'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'
import TornEdge from './TornEdge'
import { Stamp } from './art'

export default function InitiativeSection() {
  return (
    <section id="initiative" className="paper relative z-10 pb-16 pt-14 lg:py-24">
      <TornEdge />

      <div className="container-site grid items-center gap-10 lg:grid-cols-[1.25fr_0.5fr_0.9fr] lg:gap-12">
        <Reveal>
          <SectionIntro
            eyebrow="The Initiative"
            title={
              <>
                Learning to <br />
                Build with <br className="lg:hidden" />
                Nature
              </>
            }
          />
          <div className="mt-6 max-w-[34rem] space-y-4 text-[1.0625rem] leading-relaxed text-muted lg:text-base">
            <p>Heartisan Home promotes hands-on training in natural construction techniques using earth and lime.</p>
            <p>
              <strong className="font-semibold text-ink">The initiative brings together traditional knowledge,</strong>{' '}
              practical skills and contemporary sustainable construction practices, creating opportunities for both
              skilled and unskilled workers to learn, experiment and build.
            </p>
          </div>
          <Button href="#craft" className="mt-8 hidden h-11 rounded-md px-6 lg:inline-flex">
            Know More
          </Button>
        </Reveal>

        <Reveal delay={150} className="relative hidden flex-col items-center lg:flex">
          <p className="script -rotate-6 text-[1.75rem] leading-[1.55] text-terracotta">
            People
            <br />
            <span className="ml-2">Skills</span>
            <br />
            <span className="ml-3">Materials</span>
            <br />
            <span className="ml-1">A Kinder</span>
            <br />
            <span className="ml-3">Tomorrow</span>
          </p>
          <Stamp className="-mt-2 h-36 w-36 -rotate-12 text-terracotta/80" />
        </Reveal>

        <Reveal delay={250} className="relative -mx-6 md:-mx-10 lg:mx-0">
          {/* the frame sets the shape; the photo is cropped into it, keeping the main block stack in view */}
          <div className="relative aspect-[5/7] overflow-hidden sm:aspect-[4/3] lg:aspect-[9/10] lg:rounded-sm lg:shadow-[0_18px_40px_-24px_rgb(43_38_32/0.6)]">
            <Photo
              media="initiative"
              labelPosition="top-right"
              sizes="(min-width: 1280px) 364px, (min-width: 1024px) 28vw, 100vw"
              className="absolute inset-0 h-full w-full object-[50%_28%]"
            />
            {/* warm shade behind the handwritten line so it reads over the sunlit blocks */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_100%_100%,rgb(30_16_6/0.62),transparent_68%)] lg:hidden"
            />
            <TornEdge placement="top-inside" className="text-paper lg:hidden" />
            <TornEdge placement="bottom-inside" className="text-paper" />
            <p className="script pointer-events-none absolute bottom-14 right-8 -rotate-6 text-[1.9rem] leading-[1.45] text-paper drop-shadow-[0_2px_8px_rgb(0_0_0/0.5)] lg:hidden">
              Hands
              <br />
              that build
              <br />a Kinder
              <br />
              Tomorrow
            </p>
          </div>
        </Reveal>

        <Button href="#craft" className="h-16 w-full max-w-[18.5rem] justify-between! rounded-full px-8 lg:hidden">
          Know More
        </Button>
      </div>
    </section>
  )
}
