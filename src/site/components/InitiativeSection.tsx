import Photo from './Photo'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'
import { LogoFull } from './art'

export default function InitiativeSection() {
  return (
    <section id="initiative" className="paper relative z-10 pb-16 pt-14 lg:py-24">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[1.2fr_0.6fr_0.9fr] lg:gap-12">
        <Reveal>
          <SectionIntro
            eyebrow="The Initiative"
            title={
              <>
                Learning to <br />
                Build with <br className="md:hidden" />
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
        </Reveal>

        <Reveal delay={150} className="relative flex flex-col items-center">
          <p className="script hidden -rotate-6 text-[1.75rem] leading-[1.55] text-terracotta lg:block">
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
          <LogoFull
            alt="Heartisan Home logo: a hummingbird in a circle of leaves, with the words Building with Earth. Learning with the Heart."
            sizes="15rem"
            className="h-auto w-[min(76%,15rem)] lg:mt-3 lg:w-full lg:max-w-[15rem]"
          />
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
      </div>
    </section>
  )
}
