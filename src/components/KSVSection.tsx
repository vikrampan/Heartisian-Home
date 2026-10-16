import Button from './Button'
import Photo from './Photo'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

export default function KSVSection() {
  return (
    <section id="ksv" className="paper relative pb-16 lg:pb-0">
      <div className="grid lg:grid-cols-[1.35fr_1fr] lg:grid-rows-[1fr_auto]">
        <Reveal className="px-6 pt-4 md:px-10 lg:col-start-2 lg:row-start-1 lg:self-stretch lg:bg-[#efe8dd] lg:px-14 lg:pt-20 xl:px-16">
          <SectionIntro
            eyebrow="Kanha Shanti Vanam"
            title={<>More Than <br className="lg:hidden" />a Township</>}
            titleClassName="lg:text-[2.6rem]"
          />
          <p className="mt-5 max-w-[30rem] text-[1.0625rem] leading-relaxed text-muted lg:text-base">
            Kanha Shanti Vanam is a living environment where people, nature and inner development come together. Its
            approach to township planning reflects a strong emphasis on ecological and sustainable development. The
            township received IGBC Platinum recognition for township planning in 2019.
          </p>
        </Reveal>

        {/* the frame sets the size, so the photo's own proportions never stretch the layout */}
        <div className="relative mt-10 aspect-[13/12] w-full overflow-hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:aspect-auto lg:h-full lg:min-h-[36rem]">
          <Photo
            media="ksv"
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="absolute inset-0 h-full w-full object-[50%_45%]"
          />
        </div>

        <Reveal
          delay={150}
          className="px-6 pt-10 text-center md:px-10 lg:col-start-2 lg:row-start-2 lg:bg-[#efe8dd] lg:px-14 lg:pb-20 lg:pt-8 lg:text-left xl:px-16"
        >
          <p className="quote mx-auto max-w-[22rem] text-[1.35rem] leading-snug text-ink/90 lg:mx-0 lg:max-w-[28rem] lg:text-[1.3rem]">
            “A place where sustainable development goes beyond buildings — embracing the way we live, learn, connect and
            evolve.”
          </p>
          <Button
            href="https://heartfulness.org/kanha/"
            external
            variant="outline"
            className="mt-8 h-14 rounded-full px-8 lg:h-12 lg:px-7"
          >
            Explore KSV
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
