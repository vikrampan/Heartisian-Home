import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useDialog } from '../../site/hooks/useDialog'
import { onLinkClick, type Registration, type Workshop } from '../lib'
import { Icon, Spinner } from '../ui'

// Building blocks for the admin screens.

export function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
}

export function Card({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-[0_10px_30px_-24px_rgb(43_38_32/0.6)] ring-1 ring-ink/8 sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-display text-[1.35rem] leading-tight text-ink">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Link({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} onClick={onLinkClick} className={className}>
      {children}
    </a>
  )
}

const FIELD = 'w-full rounded-lg border border-ink/15 bg-white px-3 text-[0.9375rem] text-ink outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20'

export function Field({ label, hint, children, className = '' }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs leading-snug text-muted">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD} h-10 ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${FIELD} py-2 leading-relaxed ${props.className ?? ''}`} />
}

/** A list edited as one item per line. */
export function Lines({ value, onChange, rows = 4, placeholder }: { value: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string }) {
  return (
    <TextArea
      rows={rows}
      placeholder={placeholder}
      value={value.join('\n')}
      onChange={(e) => onChange(e.target.value.split('\n'))}
    />
  )
}

export function Note({ tone = 'error', children }: { tone?: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const cls = tone === 'error' ? 'bg-[#f6dcd5] text-[#8f2f1f]' : tone === 'ok' ? 'bg-[#e1e6cc] text-[#3f4b25]' : 'bg-coast/10 text-[#3d5868]'
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3.5 py-2.5 text-sm ${cls}`}>
      {children}
    </p>
  )
}

export function Busy({ label = 'Loading' }: { label?: string }) {
  return (
    <p role="status" className="flex items-center gap-2.5 py-10 text-muted">
      <Spinner /> {label}…
    </p>
  )
}

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const ref = useDialog(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-paper shadow-[-30px_0_60px_-30px_rgb(0_0_0/0.6)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-ink/10 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-ink/5">
            <Icon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <footer className="border-t border-ink/10 bg-white px-5 py-3 sm:px-6">{footer}</footer>}
      </div>
    </div>
  )
}

/** Places in use as a bar: confirmed, then payment to check, then held. */
export function FillBar({ w }: { w: Workshop & { counts?: Partial<Record<Registration['status'], number>> } }) {
  const c = w.counts ?? {}
  const seg = (n: number | undefined, cls: string) =>
    n ? <span className={cls} style={{ width: `${Math.min(100, (n / w.seats) * 100)}%` }} /> : null
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-ink/8" aria-hidden="true">
        {seg(c.confirmed, 'bg-[#6b7a3e]')}
        {seg(c.verifying, 'bg-[#d9902f]')}
        {seg(c.held, 'bg-terracotta/60')}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        <strong className="text-ink">{c.confirmed ?? 0}</strong> confirmed
        {c.verifying ? ` · ${c.verifying} to check` : ''}
        {c.held ? ` · ${c.held} awaiting payment` : ''} · {w.seats_left} of {w.seats} free
        {c.waitlisted ? ` · ${c.waitlisted} waiting` : ''}
        {c.interested ? ` · ${c.interested} interested` : ''}
      </p>
    </div>
  )
}
