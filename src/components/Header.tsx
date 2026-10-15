import { useEffect, useState } from 'react'
import Beam from './Beam'
import Logo from './Logo'
import { IconMenu } from './icons'
import { NAV } from '../data/content'

interface HeaderProps {
  activeNav: number
  menuOpen: boolean
  onMenuOpen: () => void
}

function NavLinks({ items, offset, activeNav }: { items: readonly (typeof NAV)[number][]; offset: number; activeNav: number }) {
  return (
    <ul className="hidden items-center gap-[1.4rem] xl:flex">
      {items.map((item, index) => (
        <li key={item.href}>
          <a
            href={item.href}
            aria-current={activeNav === offset + index ? 'true' : undefined}
            className="on-wood relative whitespace-nowrap py-1.5 text-[0.9375rem] font-medium transition-colors hover:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-tan after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=true]:after:scale-x-100"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function Header({ activeNav, menuOpen, onMenuOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 40)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header
      inert={menuOpen}
      className={`beam-scope pointer-events-none fixed inset-x-0 top-0 z-50 transition-[translate] duration-500 ease-soft ${
        scrolled ? '-translate-y-[calc(var(--beam-h)*0.0787)]' : ''
      }`}
    >
      {/* the brackets fold away once the beam docks */}
      <div className={`transition-[clip-path] duration-500 ease-soft ${scrolled ? '[clip-path:inset(0_0_54.75%_0)]' : '[clip-path:inset(0)]'}`}>
        <Beam lotusClassName="hidden min-[85rem]:block" />
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-[calc(var(--beam-h)*0.4525)] h-6 bg-gradient-to-b from-black/35 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <nav aria-label="Primary" className="beam-bar pointer-events-auto">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center justify-between gap-4">
            <a href="#hero" aria-label="Heartisan Home — back to top" className="on-wood shrink-0">
              <Logo breakOnMobile showTagline={false} />
            </a>
            <NavLinks items={NAV.slice(0, 4)} offset={0} activeNav={activeNav} />
          </div>

          {/* keeps the links clear of the lotus carving when it is shown */}
          <span aria-hidden="true" className="w-0 xl:w-5 min-[85rem]:w-[calc(var(--beam-h)_*_1.656_+_1rem)]" />

          <div className="flex items-center justify-end gap-4 xl:justify-between">
            <NavLinks items={NAV.slice(4)} offset={4} activeNav={activeNav} />
            <a
              href="#footer"
              className="hidden h-9 items-center gap-2 rounded-full bg-paper px-4 text-sm font-medium text-ink shadow-[0_2px_6px_rgb(0_0_0/0.35)] transition-colors hover:bg-white xl:inline-flex"
            >
              Get Involved <span aria-hidden="true">→</span>
            </a>
            <button
              type="button"
              onClick={onMenuOpen}
              aria-label="Open menu"
              aria-haspopup="dialog"
              className="on-wood -mr-2 flex h-11 w-11 items-center justify-center xl:hidden"
            >
              <IconMenu className="h-7 w-7 drop-shadow-[0_1px_2px_rgb(0_0_0/0.65)]" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
