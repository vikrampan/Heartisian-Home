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
    // phones: a row with a thumbnail; tablets and up: a photo card
    <article className="group flex h-full items-center gap-4 rounded-xl bg-card p-3.5 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] md:flex-col md:items-stretch md:gap-0 md:overflow-hidden md:rounded-lg md:p-0">
      <div className="h-28 w-[7.5rem] shrink-0 overflow-hidden rounded-lg md:aspect-[6/5] md:h-auto md:w-full md:rounded-none">
        <Photo
          media={media}
          labelPosition="none"
          className={`h-full w-full transition-transform duration-[1.6s] ease-[var(--ease-soft)] md:group-hover:scale-[1.04] ${photoClassName}`}
        />
      </div>
      <div className="md:flex md:flex-1 md:flex-col md:items-center md:px-4 md:pb-6 md:pt-5 md:text-center">
        <h3 className="text-[1.05rem] font-semibold leading-snug text-ink md:text-base">{name}</h3>
        <p className="mt-1.5 text-[0.95rem] leading-snug text-muted md:mt-2 md:text-sm">{description}</p>
      </div>
    </article>
  )
}
