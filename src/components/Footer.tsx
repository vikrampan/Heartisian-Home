import Logo from './Logo'
import Photo from './Photo'
import { IconInstagram, IconLinkedin, IconYoutube } from './icons'
import { NAV } from '../data/content'

const SOCIAL = [
  { label: 'Instagram', icon: IconInstagram },
  { label: 'YouTube', icon: IconYoutube },
  { label: 'LinkedIn', icon: IconLinkedin },
]

const LEGAL = ['Privacy Policy', 'Terms', 'Sitemap']

function NavList({ items, className = '' }: { items: readonly (typeof NAV)[number][]; className?: string }) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((item) => (
        <li key={item.href}>
          <a href={item.href} className="text-[0.95rem] text-paper/85 transition-colors hover:text-paper">
            {item.footerLabel}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="relative overflow-hidden bg-moss-deep text-paper">
      <div className="container-site pt-16 lg:pt-14">
        <div className="flex flex-col items-center gap-10 text-center lg:grid lg:grid-cols-[1.5fr_0.75fr_0.75fr_1.2fr] lg:items-start lg:gap-8 lg:text-left">
          <Logo stacked className="lg:hidden" />
          <Logo className="hidden lg:flex" />

          <nav aria-label="Footer" className="lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-8">
            <NavList items={NAV} className="lg:hidden" />
            <NavList items={NAV.slice(0, 4)} className="hidden lg:block" />
            <NavList items={NAV.slice(4)} className="hidden lg:block" />
          </nav>

          <div className="w-full border-t border-paper/15 pt-8 lg:w-auto lg:border-0 lg:pt-0 lg:text-right">
            <p className="text-[1.0625rem] text-paper/90">
              People <span aria-hidden="true" className="mx-2">·</span> Place{' '}
              <span aria-hidden="true" className="mx-2">·</span> Purpose
            </p>
            <ul className="mt-6 flex justify-center gap-7 lg:justify-end">
              {SOCIAL.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <a href="#footer" aria-label={label} className="block text-paper/90 transition-colors hover:text-paper">
                    <Icon className="h-6 w-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 border-t border-paper/15 py-8 text-center text-sm text-paper/80 lg:mt-12 lg:flex-row lg:justify-between lg:text-left">
          <p>
            &copy; {year} Heartisan Home. <br className="lg:hidden" />
            All rights reserved.
          </p>
          <ul className="flex gap-6">
            {LEGAL.map((item) => (
              <li key={item}>
                <a href="#footer" className="transition-colors hover:text-paper">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative lg:hidden">
        <Photo media="footer" labelPosition="top-right" className="aspect-[17/10] w-full" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-moss-deep to-transparent" />
      </div>
    </footer>
  )
}
