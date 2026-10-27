import { IconPlay } from './icons'

interface HeroProps {
  onPlayVideo: () => void
}

// The image crops and the .hero-shade layers (index.css) are tuned to this photo.
export default function Hero({ onPlayVideo }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-moss-deep text-paper lg:h-[100svh] lg:max-h-[58rem] lg:min-h-[44rem]"
    >
      <picture>
        <img
          src="/images/hero/hero-wide.webp"
          alt="A craftsman smoothing earthen plaster onto a wall with a trowel, beside exposed earth blocks"
          width={1697}
          height={927}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[78%_50%] lg:object-[30%_40%]"
        />
      </picture>
      <div aria-hidden="true" className="hero-shade absolute inset-0 -z-10" />

      {/* xl+: the text keeps to the dark wall left of the man, which sits at about 30% of the photo's width */}
      <div className="container-site flex flex-1 flex-col pb-12 pt-28 md:pb-14 lg:pb-16 lg:pt-36 xl:max-w-none xl:pl-[min(calc((100vw-80rem)/2+3.5rem),calc(28vw-17rem))] hero-wide:pb-[7.75rem]">
        <div className="flex flex-1 flex-col justify-end lg:justify-center">
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
            <p className="mt-7 hidden text-[1.5625rem] leading-snug lg:block">
              Building with Earth.
              <br />
              Learning with the Heart.
            </p>
            <p className="mt-5 max-w-[22rem] text-[1.0625rem] leading-relaxed text-paper/90 lg:mt-6 lg:max-w-[23.5rem] lg:text-[1.1rem]">
              A journey into natural construction, skilled craftsmanship and ecological living at Kanha Shanti Vanam.
            </p>
          </div>

          {/* wide desktops: centred on the bricks below the trowel, as in the design. Phones, tablets and squarer
              desktops: under the text. */}
          <button
            type="button"
            onClick={onPlayVideo}
            aria-label="Watch our story — 13 minute film"
            className="group mt-12 flex flex-col items-center self-center text-center lg:mt-10 lg:flex-row lg:gap-6 lg:self-start lg:text-left hero-wide:absolute hero-wide:right-[6%] hero-wide:top-[62%] hero-wide:mt-0 hero-wide:-translate-y-1/2 hero-wide:gap-7"
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
      </div>
    </section>
  )
}
