import { useState } from 'react'
import { Icon } from './ui'

// Sharing a workshop: the apps people here use most, email, the phone's own share sheet (Instagram, Telegram…),
// and the link itself to copy. Each app opens with the workshop's link and a short line about it already filled in.

const GLYPHS = {
  whatsapp:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z',
  facebook: 'M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14.1 2C10.9 2 10.2 4.4 10.2 6v2.5H8v3.8h2.2V22H14v-9.7h2.9l.4-3.8z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452z',
}

const TILE = 'flex aspect-square w-full items-center justify-center rounded-xl transition duration-200 hover:-translate-y-0.5 focus-visible:outline-offset-2'

// the buttons share the row evenly, up to 44px each, so six still fit on a small phone
const ITEM = 'min-w-0 max-w-11 flex-1'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // older browsers, or a page not served over https
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(field)
    field.select()
    const ok = document.execCommand('copy')
    field.remove()
    return ok
  }
}

export default function ShareLinks({ url, title, text, className = '' }: { url: string; title: string; text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const apps = [
    { name: 'WhatsApp', glyph: GLYPHS.whatsapp, tone: 'bg-[#25d366] hover:bg-[#1fb855] text-white', href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}` },
    { name: 'Facebook', glyph: GLYPHS.facebook, tone: 'bg-[#1877f2] hover:bg-[#0f63d4] text-white', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'X', glyph: GLYPHS.x, tone: 'bg-[#14171a] hover:bg-black text-white', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${u}` },
    { name: 'LinkedIn', glyph: GLYPHS.linkedin, tone: 'bg-[#0a66c2] hover:bg-[#0856a3] text-white', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ]
  // the phone's own share sheet reaches every other app; on computers the buttons above are clearer
  const native = typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches

  const copy = () =>
    copyText(url).then((ok) => {
      if (!ok) return
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })

  return (
    <div className={className}>
      <ul className="flex gap-2">
        {apps.map((a) => (
          <li key={a.name} className={ITEM}>
            <a href={a.href} target="_blank" rel="noopener noreferrer" title={`Share on ${a.name}`} className={`${TILE} ${a.tone}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={a.name === 'X' ? 'h-[1.05rem] w-[1.05rem]' : 'h-5 w-5'}>
                <path d={a.glyph} />
              </svg>
              <span className="sr-only">Share on {a.name} (opens in a new tab)</span>
            </a>
          </li>
        ))}
        <li className={ITEM}>
          <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`} title="Share by email" className={`${TILE} bg-terracotta text-white hover:bg-[#84452b]`}>
            <Icon name="mail" className="h-5 w-5" />
            <span className="sr-only">Share by email</span>
          </a>
        </li>
        {native && (
          <li className={ITEM}>
            <button type="button" onClick={() => navigator.share({ title, text, url }).catch(() => {})} title="More ways to share" className={`${TILE} bg-ink/10 text-ink hover:bg-ink/15`}>
              <Icon name="share" className="h-5 w-5" />
              <span className="sr-only">More ways to share</span>
            </button>
          </li>
        )}
      </ul>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper/80 py-1.5 pl-3.5 pr-1.5 ring-1 ring-ink/10">
        <Icon name="link" className="h-4 w-4 shrink-0 text-muted" />
        <span className="w-0 min-w-0 flex-1 truncate text-sm text-ink">{url.replace(/^https?:\/\/(www\.)?/, '')}</span>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors ${copied ? 'bg-sage text-white' : 'bg-ink text-paper hover:bg-black'}`}
        >
          {copied && <Icon name="check" className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? 'Link copied' : ''}
      </p>
    </div>
  )
}
