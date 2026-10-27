import { useEffect, useState } from 'react'
import Button from './Button'
import Logo from './Logo'
import { IconMenu } from './icons'
import { NAV } from '../data/content'

interface HeaderProps {
  activeNav: number
  menuOpen: boolean
  onMenuOpen: () => void
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
    <header inert={menuOpen} className="fixed inset-x-0 top-0 z-50 text-paper">
      {/* over the hero: transparent, with a faint shade so the links read on any photo */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-[150%] bg-gradient-to-b from-[rgb(18_13_9/0.45)] to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* once the page scrolls: a solid moss-green bar */}
      <div
        aria-hidden="true"
        className={`moss absolute inset-0 shadow-[0_10px_30px_-14px_rgb(0_0_0/0.55)] transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`container-site relative flex items-center justify-between gap-6 transition-[height] duration-500 ease-soft ${
          scrolled ? 'h-16 md:h-[4.5rem]' : 'h-[4.5rem] md:h-[5.5rem]'
        }`}
      >
        <a href="#hero" aria-label="Heartisan Home — back to top" className="shrink-0">
          <Logo breakOnMobile />
        </a>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-8 2xl:gap-10">
            {NAV.map((item, index) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={activeNav === index ? 'true' : undefined}
                  className="relative py-2 text-[0.9375rem] text-paper/90 transition-colors hover:text-paper after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=true]:text-paper aria-[current=true]:after:scale-x-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Button href="#footer" variant="light" className="hidden h-11 rounded-full px-6 xl:inline-flex">
          Get Involved
        </Button>

        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className="-mr-2 flex h-11 w-11 items-center justify-center xl:hidden"
        >
          <IconMenu className="h-7 w-7" />
        </button>
      </div>
    </header>
  )
}
