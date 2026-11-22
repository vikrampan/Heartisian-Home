import { coverStill, type Still } from '../../api/_lib/covers.js'

// Real photographs only: stills from the Heartisan Home film (public/images/workshops/, 800 and 1600 px wide).

export interface Photo {
  src: string
  srcSet: string
  alt: string
  /** CSS object-position, to keep the subject in frame when cropped */
  focus?: string
}

const still = (name: string, alt: string, focus = '50% 50%'): Photo => ({
  src: `/images/workshops/${name}-1600.webp`,
  srcSet: `/images/workshops/${name}-800.webp 800w, /images/workshops/${name}-1600.webp 1600w`,
  alt,
  focus,
})

export const PHOTOS = {
  houseBuild: still('house-build', 'An earthen house with brick vaults under construction at Kanha Shanti Vanam', '55% 50%'),
  handsBlocks: still('hands-blocks', 'Hands laying earth blocks with a trowel', '55% 55%'),
  layingBlock: still('laying-block', 'A compressed earth block being placed on a wall', '40% 60%'),
  vault: still('vault-scaffold', 'Builders on scaffolding shaping a vaulted roof', '50% 45%'),
  crew: still('crew', 'Three builders working together on site', '55% 50%'),
  team: still('team', 'The Heartisan Home building team', '50% 40%'),
  aerial: still('aerial', 'Aerial view of a finished earthen building among trees', '50% 45%'),
  houseTrees: still('house-trees', 'A finished earthen house among the trees', '45% 50%'),
  carrying: still('carrying', 'A smiling builder carrying materials on his head', '50% 35%'),
}

export const GALLERY: Photo[] = [PHOTOS.houseBuild, PHOTOS.handsBlocks, PHOTOS.team, PHOTOS.vault, PHOTOS.aerial]

/** The lead photo for a workshop: its own cover if uploaded, otherwise a still that suits it. */
export function coverFor(w: { slug: string; cover_url: string | null }): Photo {
  if (w.cover_url) return { src: w.cover_url, srcSet: '', alt: '', focus: '50% 50%' }
  return BY_STILL[coverStill(w.slug)]
}

const BY_STILL: Record<Still, Photo> = {
  'house-build': PHOTOS.houseBuild,
  'hands-blocks': PHOTOS.handsBlocks,
  'laying-block': PHOTOS.layingBlock,
  'vault-scaffold': PHOTOS.vault,
  crew: PHOTOS.crew,
  team: PHOTOS.team,
  aerial: PHOTOS.aerial,
  'house-trees': PHOTOS.houseTrees,
  carrying: PHOTOS.carrying,
}

// A photo for a schedule session, only where the film shows that very work.
const SESSION_PHOTOS: [RegExp, Photo][] = [
  [/orientation|introduction, safety/i, PHOTOS.team],
  [/practical: cseb|cseb production/i, PHOTOS.handsBlocks],
  [/cseb/i, PHOTOS.layingBlock],
  [/roof/i, PHOTOS.vault],
  [/comparison|group task|integrated/i, PHOTOS.crew],
  [/house construction/i, PHOTOS.houseBuild],
  [/closing|reflection|employability/i, PHOTOS.houseTrees],
]

export const sessionPhoto = (title: string) => SESSION_PHOTOS.find(([re]) => re.test(title))?.[1]

/** A rotating set of accent colours, so repeated items (steps, tiles) don't all look the same. */
export const ACCENTS = [
  { fg: 'text-terracotta', bg: 'bg-terracotta', soft: 'bg-blush-soft' },
  { fg: 'text-ochre', bg: 'bg-ochre', soft: 'bg-ochre-soft' },
  { fg: 'text-sage', bg: 'bg-sage', soft: 'bg-sage-soft' },
  { fg: 'text-sky', bg: 'bg-sky', soft: 'bg-sky-soft' },
] as const
