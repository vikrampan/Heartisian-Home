import { LogoOnShade } from './art'

interface LogoProps {
  /** The logo's size; the header shrinks it once the page scrolls. */
  sizeClassName: string
}

export default function Logo({ sizeClassName }: LogoProps) {
  return (
    <span className="flex items-center gap-3">
      <LogoOnShade eager sizes="7.5rem" className={`transition-[width,height] duration-500 ease-soft ${sizeClassName}`} />
      <span className="flex flex-col gap-1">
        <span className="font-sans text-[0.95rem] font-semibold uppercase leading-[1.15] tracking-[0.12em]">
          Heartisan <br className="md:hidden" />
          Home
        </span>
        <span className="hidden text-[0.6875rem] leading-tight opacity-80 md:block">
          Building with Earth. Learning with the Heart.
        </span>
      </span>
    </span>
  )
}
