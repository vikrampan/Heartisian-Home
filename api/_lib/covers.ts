// The film stills in public/images/workshops/, and which one stands for a workshop that has no cover photo of its
// own. Shared by the workshop pages and the link previews, so a shared link shows the same photo as the page.

export const STILLS = ['house-build', 'hands-blocks', 'laying-block', 'vault-scaffold', 'crew', 'team', 'aerial', 'house-trees', 'carrying'] as const

export type Still = (typeof STILLS)[number]

export function coverStill(slug: string): Still {
  if (/programme|technician/.test(slug)) return 'house-build'
  if (/introduction/.test(slug)) return 'hands-blocks'
  return STILLS[[...slug].reduce((n, c) => n + c.charCodeAt(0), 0) % STILLS.length]
}

/** The 1200 × 630 crop used for link previews (WhatsApp, Facebook, LinkedIn, X). */
export const previewImage = (still: Still) => `/images/workshops/og/${still}.jpg`
