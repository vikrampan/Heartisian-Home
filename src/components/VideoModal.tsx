import { useDialog } from '../hooks/useDialog'
import Photo from './Photo'
import { IconClose, IconPlay } from './icons'
import { VIDEO } from '../data/media'

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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-moss-deep/95 p-4 sm:p-10"
    >
      <div ref={containerRef} onClick={(event) => event.stopPropagation()} className="w-full max-w-5xl text-paper">
        <div className="mb-4 flex items-center justify-between">
          <p className="eyebrow">Our Story — 13 minute film</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 transition-colors hover:bg-paper/10"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
          {VIDEO.story ? (
            <video src={VIDEO.story} controls autoPlay playsInline className="h-full w-full" />
          ) : (
            <>
              <Photo media="story" labelPosition="none" className="absolute inset-0 h-full w-full" />
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-paper/90">
                <IconPlay className="ml-1 h-8 w-8" />
              </span>
            </>
          )}
        </div>

        {!VIDEO.story && (
          <p className="mt-4 text-center text-sm text-paper/80">The film will play here once the final video is added.</p>
        )}
      </div>
    </div>
  )
}
