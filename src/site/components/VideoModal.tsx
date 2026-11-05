import { useDialog } from '../hooks/useDialog'
import FilmPlayer from '../../shared/FilmPlayer'
import { IconClose } from './icons'

interface VideoModalProps {
  open: boolean
  onClose: () => void
}

export default function VideoModal({ open, onClose }: VideoModalProps) {
  const containerRef = useDialog(open, onClose)

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Our Story — 13 minute film"
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-moss-deep/95 p-4 sm:p-10 phone-landscape:p-0"
    >
      {/* limited by the screen's height too, so the 3:2 film never pushes the close button off a laptop screen */}
      <div
        ref={containerRef}
        onClick={(event) => event.stopPropagation()}
        className="relative w-[min(100%,64rem,calc((100svh-6rem)*3/2))] text-paper sm:w-[min(100%,64rem,calc((100svh-9.5rem)*3/2))] phone-landscape:w-[calc(100svh*3/2)]"
      >
        <div className="mb-4 flex items-center justify-between phone-landscape:absolute phone-landscape:right-2 phone-landscape:top-2 phone-landscape:z-10 phone-landscape:mb-0">
          <p className="eyebrow phone-landscape:hidden">Our Story — 13 minute film</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 transition-colors hover:bg-paper/10 phone-landscape:bg-black/40"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <FilmPlayer autoStart className="w-full rounded-lg phone-landscape:rounded-none" />
      </div>
    </div>
  )
}
