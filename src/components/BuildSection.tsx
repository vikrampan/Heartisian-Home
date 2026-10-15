import Button from './Button'
import Photo from './Photo'
import Reveal from './Reveal'
import TornEdge from './TornEdge'
import { BotanicalSprig } from './art'

export default function BuildSection() {
  return (
    <section
      id="build"
      className="relative isolate flex min-h-[52rem] flex-col overflow-hidden text-paper lg:min-h-0 lg:py-24"
    >
      <Photo media="build" labelPosition="bottom-left" className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_16_10/0.15)_0%,rgb(24_16_10/0.45)_45%,rgb(24_16_10/0.85)_100%)] lg:bg-[linear-gradient(90deg,rgb(24_16_10/0.2)_0%,rgb(24_16_10/0.4)_40%,rgb(24_16_10/0.15)_100%)]" />
      <TornEdge placement="top-inside" className="hidden text-paper lg:block" />

      <div className="container-site flex flex-1 flex-col justify-end pb-10 pt-32 lg:flex-row lg:items-center lg:justify-between lg:pb-0 lg:pl-[16%] lg:pt-0">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-[3.15rem] leading-[1.08] lg:text-[3.5rem]">
            Build with <br className="lg:hidden" />
            the Earth.
            <br />
            Build with <br className="lg:hidden" />
            the Heart.
          </h2>
          <p className="mt-6 max-w-[22rem] text-[1.0625rem] leading-relaxed text-paper/90 lg:mt-4 lg:max-w-xl">
            Be part of a movement that brings together sustainable construction, skilled craftsmanship, ecological
            living and human evolution.
          </p>
          <Button href="#initiative" variant="light" className="mt-8 h-16 w-full max-w-[20rem] justify-between! rounded-full px-8 lg:hidden">
            Discover Heartisan Home
          </Button>
          <Button href="#initiative" className="mt-7 hidden h-12 rounded-full bg-moss-deep! px-7 hover:bg-black! lg:inline-flex">
            Discover Heartisan Home
          </Button>
        </Reveal>

        <div aria-hidden="true" className="mt-12 flex items-end gap-2 lg:mt-0 lg:items-center lg:gap-6">
          <BotanicalSprig className="h-56 w-auto text-paper/90 lg:h-60" />
          <p className="script mb-16 -rotate-6 text-[2.2rem] leading-[1.5] text-paper lg:mb-0 lg:text-[2.6rem]">
            Build
            <br />
            <span className="ml-3">Belong</span>
            <br />
            <span className="ml-6">Evolve</span>
          </p>
        </div>
      </div>
    </section>
  )
}
