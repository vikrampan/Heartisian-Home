import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  sprout: (
    <>
      <path d="M24 42V20" />
      <path d="M24 31c-8 0-12.5-5.5-12.5-12 7 0 12.5 5 12.5 12z" />
      <path d="M24 25c0-7.5 5.5-12.5 13-12.5 0 7.5-5.5 12.5-13 12.5z" />
      <path d="M24 20c-3.2-3-3.2-7.5 0-11 3.2 3.5 3.2 8 0 11z" />
    </>
  ),
  book: (
    <>
      <path d="M24 14c-4.5-3-10.5-4-16-3v25c5.5-1 11.5 0 16 3 4.5-3 10.5-4 16-3V11c-5.5-1-11.5 0-16 3z" />
      <path d="M24 14v25M12 17c3-.4 6 .2 8.5 1.6M12 23c3-.4 6 .2 8.5 1.6M36 17c-3-.4-6 .2-8.5 1.6M36 23c-3-.4-6 .2-8.5 1.6" />
    </>
  ),
  lotus: (
    <>
      <path d="M24 11c4.5 5 4.5 14 0 21-4.5-7-4.5-16 0-21z" />
      <path d="M24 32c-2.5-7.5-8.5-12-15-12 0 7.5 6.5 12.5 15 12z" />
      <path d="M24 32c2.5-7.5 8.5-12 15-12 0 7.5-6.5 12.5-15 12z" />
      <path d="M24 32c-6 2.5-13 1.5-18-3M24 32c6 2.5 13 1.5 18-3M13 37h22" />
    </>
  ),
  people: (
    <>
      <circle cx="17" cy="15" r="5" />
      <circle cx="31" cy="15" r="5" />
      <path d="M7 38c0-7.5 4.5-12.5 10-12.5 3.6 0 6.6 2 8.4 5.4" />
      <path d="M21 38c0-7.5 4.5-12.5 10-12.5S41 30.5 41 38z" />
    </>
  ),
  learn: (
    <>
      <path d="M24 33V19" />
      <path d="M24 26c-6 0-9.5-4-9.5-9 5.5 0 9.5 4 9.5 9zM24 22c0-5.5 4-9.5 9.5-9.5 0 5.5-4 9.5-9.5 9.5z" />
      <path d="M10 33c4.5 0 9 1 12 3h6.5a2.5 2.5 0 0 1 0 5H18M10 41h8.5c3 0 9 .5 12.5-2l7-5" />
    </>
  ),
  train: (
    <>
      <path d="M9 30h30v9H9zM9 30l0-8h15v8M24 22h15v8" />
      <path d="M28 7l8 8-5 2-5-5zM28 7l-4-4" />
    </>
  ),
  build: (
    <>
      <path d="M8 24L24 11l16 13" />
      <path d="M13 20v19h22V20M21 39v-9h6v9" />
    </>
  ),
  scale: (
    <>
      <path d="M7 40h34M10 40V29h7v11M20.5 40V20h7v20M31 40V11h7v29" />
    </>
  ),
  skil: (
    <>
      <path d="M8 19L24 9l16 10z" />
      <path d="M12 21v14M20 21v14M28 21v14M36 21v14M7 38h34" />
    </>
  ),
}

interface LineIconProps {
  name: keyof typeof PATHS
  className?: string
}

export default function LineIcon({ name, className }: LineIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
