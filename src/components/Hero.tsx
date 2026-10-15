import Photo from './Photo'
import { IconArrowDown, IconPlay } from './icons'

interface HeroProps {
  onPlayVideo: () => void
}

export default function Hero({ onPlayVideo }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-moss-deep text-paper lg:h-[100svh] lg:max-h-[58rem] lg:min-h-[44rem]"
    >
      <Photo media="hero" priority labelPosition="none" className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_13_9/0.55)_0%,rgb(18_13_9/0.1)_22%,rgb(18_13_9/0.35)_55%,rgb(18_13_9/0.85)_100%)] lg:bg-[linear-gradient(90deg,rgb(18_13_9/0.78)_0%,rgb(18_13_9/0.42)_45%,rgb(18_13_9/0.12)_100%)]" />

      <div className="container-site flex flex-1 flex-col pb-7 pt-36 md:pb-10 lg:pt-40">
        <div className="flex flex-1 flex-col justify-end lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow mb-5 leading-[1.9] text-paper/90 lg:hidden">
              Building with Earth.
              <br />
              Learning with the Heart.
            </p>
            <h1 className="heading-hero">
              Heartisan
              <br />
              Home
            </h1>
            <p className="mt-7 hidden text-[1.375rem] leading-snug lg:block">
              Building with Earth.
              <br />
              Learning with the Heart.
            </p>
            <p className="mt-5 max-w-[22rem] text-[1.0625rem] leading-relaxed text-paper/90 lg:mt-6">
              A journey into natural construction, skilled craftsmanship and ecological living at Kanha Shanti Vanam.
            </p>
          </div>

          <button
            type="button"
            onClick={onPlayVideo}
            aria-label="Watch our story — 13 minute film"
            className="group mt-12 flex flex-col items-center self-center text-center lg:mr-[6%] lg:mt-0 lg:flex-row lg:gap-7 lg:text-left"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-paper/90 transition-transform duration-500 group-hover:scale-105 lg:h-24 lg:w-24">
              <IconPlay className="ml-1 h-8 w-8 lg:h-9 lg:w-9" />
            </span>
            <span className="mt-4 lg:mt-0">
              <span className="block text-lg italic lg:hidden">Watch Our Story</span>
              <span className="script hidden text-[2.1rem] leading-[1.15] lg:block">
                Watch
                <br />
                Our Story
              </span>
              <span className="mt-2 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-paper/80 lg:mt-3">
                13 Minute Film
              </span>
            </span>
          </button>
        </div>

        <div className="mt-12 flex items-end justify-between text-sm text-paper/85 lg:mt-14 lg:items-center">
          <span className="flex items-center gap-3 lg:hidden">
            <span className="h-9 w-px bg-paper/70" aria-hidden="true" />
            Scroll
          </span>
          <span className="hidden items-center gap-3 lg:flex" aria-hidden="true">
            <span className="h-px w-16 bg-paper/80" />
            {[0, 1, 2, 3].map((dot) => (
              <span key={dot} className="flex items-center gap-3">
                <span className={`rounded-full bg-paper ${dot === 0 ? 'h-2 w-2' : 'h-1.5 w-1.5 opacity-60'}`} />
                <span className="h-px w-10 bg-paper/40" />
              </span>
            ))}
          </span>
          <span className="tabular-nums lg:hidden">01 / 07</span>
          <a href="#initiative" className="hidden items-center gap-3 transition-colors hover:text-paper lg:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-paper/60">
              <span className="h-2 w-px bg-paper" />
            </span>
            Scroll
            <IconArrowDown className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
