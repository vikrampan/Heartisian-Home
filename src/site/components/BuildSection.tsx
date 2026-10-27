import Reveal from './Reveal'
import { BotanicalSprig } from './art'

function Philosophy({ className = '' }: { className?: string }) {
  return (
    <p className={`script -rotate-6 leading-[1.5] text-paper ${className}`}>
      Build
      <br />
      <span className="ml-[0.4em]">Belong</span>
      <br />
      <span className="ml-[0.8em]">Evolve</span>
    </p>
  )
}

// Tuned to the path photo in /images/build/ (crops + fades), so it is not a swappable media slot.
export default function BuildSection() {
  return (
    <section id="build" className="earth relative isolate overflow-hidden text-paper">
      <div className="container-site relative z-10 pb-8 pt-16 sm:pt-20 lg:py-28">
        {/* desktop: the column ends where the photo's fade begins, so the paragraph never runs onto the rocks */}
        <Reveal className="lg:max-w-[min(38rem,46vw)]">
          <div className="flex items-start justify-between gap-3">
            {/* phones: sized so each of the four lines fits beside the sprig */}
            <h2 className="font-display text-[clamp(2.1rem,9.4vw,2.6rem)] leading-[1.08] sm:text-[3rem] lg:text-[clamp(3rem,3.9vw,3.75rem)]">
              Build with <br className="md:hidden" />
              the Earth.
              <br />
              Build with <br className="md:hidden" />
              the Heart.
            </h2>
            <div className="mt-1 flex shrink-0 items-start lg:hidden">
              <BotanicalSprig className="h-[8.5rem] w-auto text-paper/90 sm:h-[10rem]" />
              <Philosophy className="-ml-1 mt-2 text-[1.35rem] sm:text-[1.6rem]" />
            </div>
          </div>
          {/* desktop: narrower than the headline so it ends before the photo fades in behind it */}
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-paper lg:max-w-[min(30rem,32vw)] lg:text-lg">
            Be part of a movement that brings together sustainable construction, skilled craftsmanship, ecological
            living and human evolution.
          </p>
        </Reveal>
      </div>

      {/* phones: the photo sits below the text, tucking up only by its transparent top, so the copy always stays
          on the plain earth panel. desktop: it fills the right 60% and dissolves into the panel from the left. */}
      <div className="relative -mt-10 h-[30rem] sm:h-[34rem] md:h-[44rem] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-auto lg:w-[60%] 2xl:w-[52%]">
        <picture>
          {/* tablets get the band crop too: the frame is wide there, and the band keeps the trees and shutters */}
          <source media="(min-width: 768px)" srcSet="/images/build/path-band.webp" />
          <img
            src="/images/build/path-tall.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="build-photo absolute inset-0 h-full w-full object-cover object-[70%_85%] md:object-[50%_45%]"
          />
        </picture>
      </div>

      {/* dusk at the bottom edge: it reaches solid colour exactly where the footer starts from the same colour,
          so the two photos join without a line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,rgb(24_16_10/0.4)_40%,rgb(24_16_10/0.82)_80%,rgb(24_16_10))] lg:h-44"
      />

      {/* desktop: hand-drawn sprigs and the philosophy over the photo, on a soft shade so they read on the sunlit wall */}
      <div
        className="absolute right-[5%] top-1/2 isolate hidden -translate-y-1/2 items-end gap-5 before:absolute before:-inset-x-14 before:-inset-y-12 before:-z-10 before:bg-[radial-gradient(closest-side,rgb(30_16_8/0.62),rgb(30_16_8/0.4)_55%,transparent)] lg:flex xl:right-[7%]"
      >
        <BotanicalSprig className="h-[clamp(15rem,24vw,21rem)] w-auto text-paper drop-shadow-[0_1px_3px_rgb(0_0_0/0.5)]" />
        <BotanicalSprig className="mb-8 h-[clamp(11rem,18vw,16rem)] w-auto text-paper drop-shadow-[0_1px_3px_rgb(0_0_0/0.5)]" />
        {/* its own shade too: "Evolve" sits over the brightest part of the sunlit path */}
        <Philosophy className="relative isolate mb-[4.5rem] text-[clamp(2.1rem,2.8vw,2.75rem)] [text-shadow:0_1px_12px_rgb(20_10_4/0.75)] before:absolute before:-inset-x-10 before:-inset-y-8 before:-z-10 before:bg-[radial-gradient(closest-side,rgb(30_16_8/0.6),rgb(30_16_8/0.35)_60%,transparent)]" />
      </div>
    </section>
  )
}
