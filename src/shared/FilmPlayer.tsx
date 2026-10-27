import { useRef, useState } from 'react'
import { FILM } from '../film'

type Source = { kind: 'none' } | { kind: 'embed'; src: string } | { kind: 'file' }

// YouTube and Vimeo links become their players; anything else is treated as a video file.
function resolve(link: string): Source {
  const url = link.trim()
  if (!url) return { kind: 'none' }

  const youtube = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (youtube) return { kind: 'embed', src: `https://www.youtube.com/embed/${youtube[1]}?playsinline=1&rel=0` }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([\da-f]+))?/)
  if (vimeo) {
    const hash = vimeo[2] ?? url.match(/[?&]h=([\da-f]+)/)?.[1]
    return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeo[1]}?playsinline=1&dnt=1${hash ? `&h=${hash}` : ''}` }
  }

  return { kind: 'file' }
}

const TITLE = `Our Story — ${FILM.minutes} minute film`

function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8.5 5.8v12.4L18.5 12z" fill="currentColor" />
    </svg>
  )
}

const RING =
  'flex h-20 w-20 items-center justify-center rounded-full border-2 border-paper/90 md:h-24 md:w-24 [&>svg]:ml-1 [&>svg]:h-8 [&>svg]:w-8 md:[&>svg]:h-9 md:[&>svg]:w-9'

// ---- a video file: the browser's own player, plus a resume point for a film this long ----

const STORE = `heartisan-film:${FILM.url}`

function readPosition() {
  try {
    const seconds = Number(localStorage.getItem(STORE))
    return seconds >= 15 ? seconds : 0
  } catch {
    return 0
  }
}

function writePosition(seconds: number) {
  try {
    if (seconds > 0) localStorage.setItem(STORE, String(Math.floor(seconds)))
    else localStorage.removeItem(STORE)
  } catch {
    // private browsing: the film still plays, it just won't remember where it stopped
  }
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

function FilePlayer() {
  const video = useRef<HTMLVideoElement>(null)
  const lastSaved = useRef(0)
  const [started, setStarted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [resumeAt] = useState(readPosition)

  const start = (from: number) => {
    const el = video.current
    if (!el) return
    if (from > 0) {
      // before the file's details have loaded, a seek has to wait for them
      if (el.readyState >= HTMLMediaElement.HAVE_METADATA) el.currentTime = from
      else el.addEventListener('loadedmetadata', () => (el.currentTime = from), { once: true })
    }
    setStarted(true)
    el.play().catch(() => {
      // playback was refused (e.g. a data-saver setting); the browser's controls are showing, so a tap there starts it
    })
  }

  const retry = () => {
    setFailed(false)
    video.current?.load()
  }

  return (
    <>
      {/* playsInline: phones play it in the page first; full screen stays one tap away in the controls */}
      <video
        ref={video}
        playsInline
        preload="metadata"
        controls={started}
        controlsList="nodownload"
        aria-label={TITLE}
        className="absolute inset-0 h-full w-full bg-black"
        onPlay={() => {
          setStarted(true)
          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({ title: 'Our Story', artist: 'Heartisan Home' })
          }
        }}
        onTimeUpdate={(event) => {
          const seconds = event.currentTarget.currentTime
          if (Math.abs(seconds - lastSaved.current) >= 5) {
            lastSaved.current = seconds
            writePosition(seconds)
          }
        }}
        onPause={(event) => writePosition(event.currentTarget.currentTime)}
        onEnded={() => writePosition(0)}
        onError={() => setFailed(true)}
      >
        {FILM.mobileUrl && <source src={FILM.mobileUrl} media="(max-width: 767px)" />}
        {/* the last source failing means none of them could play */}
        <source src={FILM.url} onError={() => setFailed(true)} />
        {FILM.captionsUrl && <track kind="captions" src={FILM.captionsUrl} srcLang="en" label="English" />}
      </video>

      {!started && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_center,rgb(0_0_0/0.25),rgb(0_0_0/0.6))] px-6 text-center [text-shadow:0_1px_12px_rgb(0_0_0/0.6)]">
          <button type="button" onClick={() => start(resumeAt)} className="group flex flex-col items-center gap-4">
            <span className={`${RING} transition-transform duration-500 ease-soft group-hover:scale-105`}>
              <IconPlay />
            </span>
            <span className="font-display text-xl md:text-2xl">
              {resumeAt ? `Continue from ${clock(resumeAt)}` : 'Play the film'}
            </span>
          </button>
          {resumeAt > 0 && (
            <button
              type="button"
              onClick={() => start(0)}
              className="-mt-2 py-2 text-sm text-paper/75 underline underline-offset-4 hover:text-paper"
            >
              Start from the beginning
            </button>
          )}
        </div>
      )}

      {failed && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
          <p className="max-w-sm text-paper/85">The film couldn’t load just now. Please check your connection and try again.</p>
          <button type="button" onClick={retry} className="h-11 rounded-full bg-paper px-6 text-sm font-semibold text-ink hover:bg-white">
            Try again
          </button>
        </div>
      )}
    </>
  )
}

// ---- the frame ----

// Used by both pages; each one sets the frame's width, corners and shadow through `className`.
export default function FilmPlayer({ className = '' }: { className?: string }) {
  const source = resolve(FILM.url)

  return (
    <div className={`relative mx-auto aspect-video overflow-hidden bg-[#0e0b08] text-paper ${className}`}>
      {source.kind === 'embed' && (
        <iframe
          src={source.src}
          title={TITLE}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {source.kind === 'file' && <FilePlayer />}

      {source.kind === 'none' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_50%_40%,#3b3d2e,#14120d_78%)] px-6 text-center">
          <span className={`${RING} opacity-45`}>
            <IconPlay />
          </span>
          <p className="font-display text-xl md:text-2xl">The film is on its way</p>
          <p className="-mt-2 text-sm text-paper/70">Our {FILM.minutes} minute story will play here soon.</p>
        </div>
      )}
    </div>
  )
}
