import TicketCard, { NoWorkshops } from './TicketCard'
import { api, useLoad, useTitle, type Workshop } from './lib'
import { Loading, Page } from './ui'

export default function WorkshopsPage() {
  useTitle('Workshops — Heartisan Home')
  const { data, error, loading } = useLoad('list', () => api<Workshop[]>('workshops'))

  return (
    <Page>
      <section className="paper relative overflow-hidden">
        <div className="container-site grid gap-10 pb-14 pt-12 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pb-20 lg:pt-20">
          <div>
            <p className="eyebrow text-muted">Workshops at Kanha Shanti Vanam</p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,5vw+1rem,4.75rem)] leading-[1.04] text-ink">
              Learn to build
              <br />
              with earth
            </h1>
            <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-muted lg:text-lg">
              Hands-on workshops in earth and lime building: real materials, demonstrations and supervised practice, led
              by trainers who build this way every day.
            </p>
            <p className="script mt-6 -rotate-2 text-[1.75rem] text-terracotta">Build · Belong · Evolve</p>
          </div>
          <div className="relative">
            <img
              src="/images/initiative/blocks-1024.webp"
              srcSet="/images/initiative/blocks-640.webp 640w, /images/initiative/blocks-1024.webp 1024w"
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt="Stacked compressed earth blocks in warm sunlight"
              className="aspect-[4/3] w-full rounded-2xl object-cover object-[50%_30%] shadow-[0_30px_60px_-34px_rgb(43_38_32/0.7)] lg:aspect-[5/4]"
            />
            <p className="absolute -bottom-5 left-5 rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_12px_30px_-14px_rgb(43_38_32/0.6)]">
              Kanha Shanti Vanam, Telangana
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="upcoming" className="paper pb-20 pt-10 lg:pb-28">
        <div className="container-site">
          <h2 id="upcoming" className="eyebrow flex items-center gap-4 text-muted">
            Upcoming workshops
            <span aria-hidden="true" className="h-px flex-1 bg-current opacity-30" />
          </h2>
          <div className="mt-8 space-y-8">
            {loading && <Loading label="Finding the next workshops" />}
            {error && <NoWorkshops />}
            {data && (data.length ? data.map((w) => <TicketCard key={w.id} w={w} />) : <NoWorkshops />)}
          </div>
        </div>
      </section>
    </Page>
  )
}
