import type { CSSProperties } from 'react'
import { useDialog } from '../hooks/useDialog'
import { IconClose } from './icons'
import { NAV } from '../data/content'

interface MobileMenuProps {
  open: boolean
  activeNav: number
  onClose: () => void
}

// Opening decelerates gently; closing is quicker and accelerates away.
const motion = (open: boolean) => (open ? 'duration-700 ease-soft' : 'duration-500 ease-in')

// Links follow the drawer in one by one.
const stagger = (open: boolean, index: number): CSSProperties => ({
  transitionDelay: open ? `${160 + index * 45}ms` : '0ms',
})

export default function MobileMenu({ open, activeNav, onClose }: MobileMenuProps) {
  const containerRef = useDialog(open, onClose)

  return (
    // Removed from layout on desktop while closed, so the photo is never downloaded there.
    <div className={open ? '' : 'xl:hidden'}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[59] bg-ink/60 transition-opacity ${motion(open)} ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        // the shadow only exists while open — when closed it would bleed onto the left edge of the page
        className={`fixed inset-y-0 left-0 z-[60] w-full max-w-[30rem] overflow-hidden bg-[#7b5536] transition-[translate,box-shadow] ${motion(open)} ${
          open ? 'translate-x-0 shadow-[30px_0_60px_-30px_rgb(0_0_0/0.7)]' : '-translate-x-full shadow-none'
        }`}
      >
        {/* travels less than the drawer, so the courtyard feels revealed rather than pushed in */}
        <img
          src="/images/menu/veranda.webp"
          alt=""
          width={813}
          height={1544}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className={`absolute inset-0 h-full w-full object-cover object-left transition-transform ${motion(open)} ${
            open ? 'translate-x-0' : 'translate-x-[35%]'
          }`}
        />
        {/* warm shade behind the text column keeps cream type readable on the sunlit wall */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(38_22_10/0.55)_0%,rgb(38_22_10/0.45)_32%,rgb(38_22_10/0)_62%)]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/35 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-5 z-10 flex h-12 w-12 items-center justify-center text-paper"
        >
          <IconClose className="h-7 w-7 drop-shadow-[0_1px_3px_rgb(0_0_0/0.6)]" />
        </button>

        <nav aria-label="Site sections" className="relative flex h-full flex-col overflow-y-auto px-7 pb-[10svh] pt-14">
          <div className="my-auto">
            {/* sized against the photo's height so the column stays on the wall, clear of the lanterns */}
            <ul className="flex flex-col items-start gap-[clamp(0.55rem,1.75svh,1.2rem)]">
              {NAV.map((item, index) => (
                <li
                  key={item.href}
                  style={stagger(open, index)}
                  className={`transition-[translate,opacity] ${open ? 'duration-500 ease-soft' : 'duration-200'} ${
                    open ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
                >
                  <a
                    href={item.href}
                    onClick={onClose}
                    aria-current={activeNav === index ? 'true' : undefined}
                    className="relative inline-block font-display text-[clamp(1.25rem,2.5svh,1.85rem)] leading-[1.2] text-paper [text-shadow:0_1px_2px_rgb(30_16_6/0.5),0_2px_18px_rgb(30_16_6/0.35)] after:absolute after:inset-x-0 after:-bottom-[0.18em] after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:shadow-[0_1px_3px_rgb(0_0_0/0.35)] after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=true]:after:scale-x-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div
              style={stagger(open, NAV.length)}
              className={`mt-[clamp(1.6rem,4.4svh,2.75rem)] transition-[translate,opacity] ${open ? 'duration-500 ease-soft' : 'duration-200'} ${
                open ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}
            >
              <a
                href="#footer"
                onClick={onClose}
                className="inline-flex h-11 items-center rounded-full bg-paper px-6 font-display text-base text-ink shadow-[0_8px_24px_-10px_rgb(0_0_0/0.55)] transition-colors hover:bg-white"
              >
                Get Involved
              </a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
