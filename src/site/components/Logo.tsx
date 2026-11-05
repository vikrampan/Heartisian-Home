import { LogoMark } from './art'

interface LogoProps {
  stacked?: boolean
  breakOnMobile?: boolean
  showTagline?: boolean
  className?: string
}

export default function Logo({ stacked = false, breakOnMobile = false, showTagline = true, className = '' }: LogoProps) {
  return (
    <span className={`flex ${stacked ? 'flex-col items-center gap-3 text-center' : 'items-center gap-3'} ${className}`}>
      <LogoMark className={stacked ? 'h-14 w-14' : 'h-12 w-12 shrink-0 md:h-14 md:w-14'} />
      <span className="flex flex-col gap-1">
        <span className={`font-sans font-semibold uppercase leading-[1.15] tracking-[0.12em] ${stacked ? 'text-xl' : 'text-[0.95rem]'}`}>
          Heartisan {breakOnMobile && <br className="md:hidden" />}Home
        </span>
        {showTagline && (
          <span className={`text-[0.6875rem] leading-tight opacity-80 ${breakOnMobile ? 'hidden md:block' : ''}`}>
            Building with Earth. Learning with the Heart.
          </span>
        )}
      </span>
    </span>
  )
}
