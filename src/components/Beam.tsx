// The carved beam is cut into five slices (all 305px tall in the source):
// end pieces with rosette + hanging bracket, two plain planks that stretch, and the lotus centrepiece.
// Positions below are fractions of the beam height, set on a parent via --beam-h.
//   bar:        top 0.0787 · height 0.3738 · bottom 0.4525
//   safe inset: 0.623 (clear of the rosette and leaf carving at each end)
//   lotus:      carving is 1.656 wide

const src = (name: string) => `/images/wood/beam-${name}.webp`

interface BeamProps {
  lotusClassName?: string
  className?: string
}

export default function Beam({ lotusClassName = 'hidden', className = '' }: BeamProps) {
  return (
    <div aria-hidden="true" className={`pointer-events-none flex h-[var(--beam-h)] items-start ${className}`}>
      <img src={src('left')} alt="" width={326} height={305} className="h-full w-auto flex-none" />
      <img src={src('plank-left')} alt="" width={470} height={305} className="h-full min-w-0 flex-1 object-fill" />
      <img src={src('lotus')} alt="" width={572} height={305} className={`h-full w-auto flex-none ${lotusClassName}`} />
      <img src={src('plank-right')} alt="" width={470} height={305} className="h-full min-w-0 flex-1 object-fill" />
      <img src={src('right')} alt="" width={326} height={305} className="h-full w-auto flex-none" />
    </div>
  )
}
