import type { ReactNode } from 'react'

interface SectionIntroProps {
  eyebrow: string
  title: ReactNode
  tone?: 'dark' | 'light'
  className?: string
  titleClassName?: string
}

export default function SectionIntro({ eyebrow, title, tone = 'dark', className = '', titleClassName = '' }: SectionIntroProps) {
  return (
    <div className={className}>
      <p className={`eyebrow ${tone === 'light' ? 'text-tan' : 'text-muted'}`}>{eyebrow}</p>
      <h2 className={`heading mt-4 ${tone === 'light' ? 'text-paper' : 'text-ink'} ${titleClassName}`}>{title}</h2>
    </div>
  )
}
