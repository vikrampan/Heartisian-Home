import { Fragment } from 'react'
import { LogoMark } from './art'
import { NAV } from '../data/content'

// The layout is drawn onto this specific photo, so it is not a swappable media slot:
// rows line up with its bands — plastered wall (top 32%), brick step (34.5–68%), sunlit floor.
// Phones/tablets: the photo fills the footer height, so the bands sit at those fractions.
// Desktop: the footer is 2.6:1 and the photo is cropped top and bottom, which moves the bands
// to 0–23.7% / 27.3–76.3% / 76.3–100%.

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="relative isolate overflow-hidden bg-[#8a6a4f] text-ink">
      <picture>
        <source media="(max-width: 639px)" srcSet="/images/footer/footer-phone.webp" />
        <img
          src="/images/footer/footer-wide.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </picture>

      {/* darkens the wall so the handwriting reads; it starts from the solid colour the Build section ends on,
          so the two photos join without a line */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_16_10)_0%,rgb(24_16_10/0.8)_6%,rgb(24_16_10/0.5)_19%,rgb(24_16_10/0)_33%)] lg:bg-[linear-gradient(180deg,rgb(24_16_10)_0%,rgb(24_16_10/0.8)_5%,rgb(24_16_10/0.5)_13%,rgb(24_16_10/0)_25%)]"
      />
      {/* a patch of sunlight on the floor behind the small print */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_22%_at_50%_92%,rgb(246_238_226/0.55),transparent_100%)] lg:bg-[radial-gradient(34%_20%_at_50%_92%,rgb(246_238_226/0.55),transparent_100%)]"
      />
      {/* a soft shadow behind the carving, so it reads over sun patches and the pale mortar joints */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_20%_at_50%_51.5%,rgb(36_14_6/0.3),rgb(36_14_6/0.16)_60%,transparent_100%)] lg:bg-[radial-gradient(34%_19%_at_50%_52%,rgb(36_14_6/0.34),rgb(36_14_6/0.18)_60%,transparent_100%)]"
      />

      {/* full width on purpose: the rows must track the photo, which always spans the whole screen */}
      <div className="grid h-[46rem] grid-rows-[32fr_2.5fr_33.5fr_32fr] px-6 text-center md:px-10 lg:aspect-[2.6/1] lg:h-auto lg:max-h-[48rem] lg:grid-rows-[23.7fr_3.6fr_49fr_23.7fr]">
        {/* on the wall */}
        <p className="row-start-1 flex items-center justify-center pt-4">
          <span className="script inline-block -rotate-3 text-[1.9rem] leading-[1.35] text-paper [text-shadow:0_1px_14px_rgb(20_12_6/0.7)] lg:text-[clamp(1.9rem,2.4vw,2.6rem)]">
            Building with Earth. <br className="lg:hidden" />
            Learning with the Heart.
          </span>
        </p>

        {/* carved into the brick step */}
        <div className="carved row-start-3 flex flex-col items-center justify-center gap-[clamp(1rem,2.2vw,1.6rem)]">
          <div className="flex flex-col items-center gap-2.5 lg:flex-row lg:gap-4">
            <LogoMark className="h-10 w-10 drop-shadow-[0_-1px_0_rgb(48_18_6/0.6)] lg:h-[clamp(2.5rem,3.2vw,3.25rem)] lg:w-[clamp(2.5rem,3.2vw,3.25rem)]" />
            <p className="font-display text-[clamp(1.25rem,6.4vw,1.6rem)] uppercase leading-none tracking-[0.18em] lg:text-[clamp(1.75rem,2.6vw,2.6rem)] lg:tracking-[0.22em]">
              Heartisan Home
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex max-w-[22rem] flex-wrap items-center justify-center gap-x-5 gap-y-2.5 md:max-w-[36rem] lg:max-w-none lg:gap-x-[clamp(1rem,1.5vw,1.5rem)] lg:gap-y-1.5">
              {NAV.map((item, index) => (
                <Fragment key={item.href}>
                  {/* desktop: two balanced lines, like an inscription — and clear of the sunlit bricks at the far left */}
                  {index === 4 && <li aria-hidden="true" className="hidden h-0 basis-full lg:block" />}
                  <li className="flex items-center gap-x-[clamp(1rem,1.5vw,1.5rem)]">
                    {index > 0 && index !== 4 && (
                      <span aria-hidden="true" className="hidden opacity-70 lg:inline">
                        ·
                      </span>
                    )}
                    <a
                      href={item.href}
                      className="relative py-1 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 lg:text-[clamp(0.8125rem,1vw,0.9375rem)]"
                    >
                      {item.footerLabel}
                    </a>
                  </li>
                </Fragment>
              ))}
            </ul>
          </nav>
        </div>

        {/* on the sunlit floor */}
        <div className="row-start-4 flex flex-col items-center justify-end gap-2 pb-7 lg:pb-[clamp(1.25rem,2vw,2rem)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink">
            People <span aria-hidden="true">·</span> Place <span aria-hidden="true">·</span> Purpose
          </p>
          <p className="text-[0.8125rem] text-ink/85">&copy; {year} Heartisan Home. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
