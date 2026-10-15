import ImagePlaceholder, { type LabelPosition } from './ImagePlaceholder'
import { MEDIA, type MediaKey } from '../data/media'

interface PhotoProps {
  media: MediaKey
  className?: string
  labelPosition?: LabelPosition
  priority?: boolean
  /** Rendered width of the photo, so the browser can pick the right file from srcSet. */
  sizes?: string
}

export default function Photo({ media, className = '', labelPosition, priority = false, sizes = '100vw' }: PhotoProps) {
  const item = MEDIA[media]

  if (!item.src) {
    return <ImagePlaceholder tone={item.tone} label={item.label} labelPosition={labelPosition} className={className} />
  }

  return (
    <img
      src={item.src}
      srcSet={item.srcSet}
      sizes={item.srcSet ? sizes : undefined}
      alt={item.label}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-cover ${className}`}
    />
  )
}
