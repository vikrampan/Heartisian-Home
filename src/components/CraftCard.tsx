import Photo from './Photo'
import type { MediaKey } from '../data/media'

interface CraftCardProps {
  media: MediaKey
  name: string
  description: string
}

export default function CraftCard({ media, name, description }: CraftCardProps) {
  return (
    <article className="flex h-full items-center gap-4 rounded-xl bg-card p-3.5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:p-0">
      <Photo
        media={media}
        labelPosition="none"
        className="h-28 w-[6.75rem] shrink-0 rounded-lg lg:aspect-[6/5] lg:h-auto lg:w-full lg:rounded-none"
      />
      <div className="lg:flex lg:flex-1 lg:flex-col lg:items-center lg:px-4 lg:pb-6 lg:pt-5 lg:text-center">
        <h3 className="text-[1.05rem] font-semibold leading-snug text-ink lg:text-base">{name}</h3>
        <p className="mt-1.5 text-[0.95rem] leading-snug text-muted lg:mt-2 lg:text-sm">{description}</p>
      </div>
    </article>
  )
}
