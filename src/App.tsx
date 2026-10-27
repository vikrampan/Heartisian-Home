import FilmPlayer from './FilmPlayer'
import { FILM } from './film'

// A single-purpose page: the 13 minute film. On a phone held sideways, everything but the film steps aside.
export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="px-5 pt-6 text-center md:pt-7 phone-landscape:hidden">
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.22em]">Heartisan Home</p>
        <p className="mt-1.5 text-xs text-paper/65">Building with Earth. Learning with the Heart.</p>
      </header>

      <main className="flex flex-1 flex-col justify-center py-10 md:px-10 phone-landscape:py-0">
        <div className="mx-auto w-full max-w-5xl">
          <div className="px-5 text-center phone-landscape:hidden">
            <p className="eyebrow text-clay">Our Story · {FILM.minutes} minute film</p>
            <h1 className="mt-4 font-display text-[clamp(2.1rem,7vw,3.4rem)] leading-[1.1]">The Heart Behind Our Homes.</h1>
            <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-paper/80">
              A {FILM.minutes} minute film that takes you through our philosophy, process, people and the places that
              inspire us.
            </p>
          </div>

          {/* edge to edge on phones, so the film is as large as the screen allows */}
          <FilmPlayer className="mt-8 md:mt-9 phone-landscape:mt-0" />

          <p className="mt-5 px-5 text-center text-sm text-paper/60 phone-landscape:hidden">Best watched with the sound on.</p>
        </div>
      </main>

      <footer className="px-5 pb-6 text-center text-xs text-paper/45 phone-landscape:hidden">
        &copy; {new Date().getFullYear()} Heartisan Home · Kanha Shanti Vanam
      </footer>
    </div>
  )
}
