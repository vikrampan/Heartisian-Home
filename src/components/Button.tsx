import type { ReactNode } from 'react'
import { IconArrow } from './icons'

const VARIANTS = {
  dark: 'bg-moss text-paper hover:bg-moss-deep',
  light: 'bg-paper text-ink hover:bg-white',
  outline: 'border border-ink/45 text-ink hover:border-ink hover:bg-ink hover:text-paper',
} as const

interface ButtonProps {
  href: string
  children: ReactNode
  variant?: keyof typeof VARIANTS
  className?: string
  onClick?: () => void
}

export default function Button({ href, children, variant = 'dark', className = '', onClick }: ButtonProps) {
  // `hidden` from the caller must win; Tailwind's cascade would otherwise let `inline-flex` override it.
  const display = /(^|\s)hidden(\s|$)/.test(className) ? '' : 'inline-flex'

  return (
    <a
      href={href}
      onClick={onClick}
      className={`group ${display} items-center justify-center gap-3 text-[0.9375rem] font-medium transition-colors duration-300 ${VARIANTS[variant]} ${className}`}
    >
      {children}
      <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  )
}
