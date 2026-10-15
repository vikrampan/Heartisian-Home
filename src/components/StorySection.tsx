import Photo from './Photo'
import Reveal from './Reveal'
import TornEdge from './TornEdge'
import { IconPlay } from './icons'

interface StorySectionProps {
  onPlayVideo: () => void
}

export default function StorySection({ onPlayVideo }: StorySectionProps) {
  return (
    <section id="story" className="paper relative z-10 pb-20 pt-14 lg:py-28">
      <TornEdge />

      <div className="container-site grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <Reveal>
          <p className="eyebrow text-muted">Our Story</p>
          <span className="mt-4 block h-px w-10 bg-ink/40" aria-hidden="true" />
          <h2 className="heading mt-5 text-ink">
            The Heart <br className="lg:hidden" />
            Behind <br className="hidden lg:inline" />
            Our <br className="lg:hidden" />
            Homes.
          </h2>
          <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-muted">
            A 13 minute film that takes you through our philosophy, process, people and the places that inspire us.
          </p>
          <p className="quote mt-10 hidden text-[1.75rem] leading-snug text-ink lg:block">
            “It’s not just construction.
            <br />
            It’s a way of living.”
          </p>
        </Reveal>

        <Reveal delay={150}>
          <button
            type="button"
            onClick={onPlayVideo}
            aria-label="Watch our story — 13 minute film"
            className="group relative block w-full overflow-hidden rounded-lg"
          >
            <Photo media="story" labelPosition="top-right" className="aspect-[6/5] w-full lg:aspect-[16/11]" />
            <span className="absolute inset-0 bg-black/15 transition-colors duration-500 group-hover:bg-black/25" />
            <span className="absolute left-1/2 top-1/2 flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-paper/90 text-paper transition-transform duration-500 group-hover:scale-110 lg:h-24 lg:w-24">
              <IconPlay className="ml-1 h-7 w-7 lg:h-9 lg:w-9" />
            </span>
          </button>
          <p className="mt-6 text-center font-display text-[0.95rem] uppercase leading-relaxed tracking-[0.22em] text-ink">
            Watch Our Story
            <br />
            13 Minutes
          </p>
          <p className="quote mt-10 text-center text-[1.6rem] leading-snug text-ink lg:hidden">
            “It’s not just construction.
            <br />
            It’s a way of living.”
          </p>
        </Reveal>
      </div>
    </section>
  )
}
