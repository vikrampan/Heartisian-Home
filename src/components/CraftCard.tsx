import Photo from './Photo'
import type { MediaKey } from '../data/media'

interface CraftCardProps {
  media: MediaKey
  name: string
  description: string
  /** Per-photo crop (object-position) and, for studio shots on white, a blend into the card colour. */
  photoClassName?: string
}

export default function CraftCard({ media, name, description, photoClassName = '' }: CraftCardProps) {
  return (
    <article className="group flex h-full items-center gap-4 rounded-xl bg-card p-3.5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] transition-[translate,box-shadow] duration-500 ease-[var(--ease-soft)] lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:p-0 lg:hover:-translate-y-1 lg:hover:shadow-[0_22px_40px_-18px_rgb(0_0_0/0.7)]">
      <div className="h-28 w-[7.5rem] shrink-0 overflow-hidden rounded-lg lg:aspect-[6/5] lg:h-auto lg:w-full lg:rounded-none">
        <Photo
          media={media}
          labelPosition="none"
          className={`h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-soft)] lg:group-hover:scale-105 ${photoClassName}`}
        />
      </div>
      <div className="lg:flex lg:flex-1 lg:flex-col lg:items-center lg:px-4 lg:pb-6 lg:pt-5 lg:text-center">
        <h3 className="text-[1.05rem] font-semibold leading-snug text-ink lg:text-base">{name}</h3>
        <p className="mt-1.5 text-[0.95rem] leading-snug text-muted lg:mt-2 lg:text-sm">{description}</p>
      </div>
    </article>
  )
}
