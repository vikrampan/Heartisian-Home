import TicketCard, { NoWorkshops } from './TicketCard'
import { api, useLoad, useTitle, type Workshop } from './lib'
import { PHOTOS } from './photos'
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
          </div>
          <div className="grid grid-cols-5 gap-2">
            <img
              src={PHOTOS.houseBuild.src}
              srcSet={PHOTOS.houseBuild.srcSet}
              sizes="(min-width: 1024px) 30vw, 60vw"
              alt={PHOTOS.houseBuild.alt}
              className="col-span-3 aspect-[3/4] h-full w-full rounded-2xl object-cover object-[55%_50%]"
            />
            <div className="col-span-2 grid gap-2">
              <img src={PHOTOS.handsBlocks.src} srcSet={PHOTOS.handsBlocks.srcSet} sizes="(min-width: 1024px) 20vw, 40vw" alt={PHOTOS.handsBlocks.alt} className="aspect-square h-full w-full rounded-2xl object-cover object-[55%_55%]" />
              <img src={PHOTOS.team.src} srcSet={PHOTOS.team.srcSet} sizes="(min-width: 1024px) 20vw, 40vw" alt={PHOTOS.team.alt} className="aspect-square h-full w-full rounded-2xl object-cover object-[50%_40%]" />
            </div>
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
