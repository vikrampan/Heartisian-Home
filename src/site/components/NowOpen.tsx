// The small tag on the Workshops menu link while registration is open, with a softly pulsing dot.
export default function NowOpen({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-ochre px-1.5 py-[2px] font-sans text-[0.58rem] font-bold uppercase leading-none tracking-[0.1em] text-ink shadow-[0_2px_8px_-2px_rgb(0_0_0/0.4)] ${className}`}
    >
      <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-deep opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-deep" />
      </span>
      Now open
    </span>
  )
}
