// Every photo / video on the page; a labelled placeholder shows until a file is set.
// Optimised copies live in a subfolder of /public/images (e.g. /public/images/ksv/) and are wired in
// as slot(label, tone, src, srcSet) — srcSet lists the sizes so phones download the smaller file.

export type Tone = 'earth' | 'clay' | 'lime' | 'stone' | 'soil' | 'forest' | 'lake' | 'dusk'

export interface MediaSlot {
  label: string
  tone: Tone
  src?: string
  srcSet?: string
}

const slot = (label: string, tone: Tone, src?: string, srcSet?: string): MediaSlot => ({ label, tone, src, srcSet })

export const MEDIA = {
  hero: slot('Hands pressing an earth block', 'earth'),
  initiative: slot(
    'Stacked compressed earth blocks in warm sunlight',
    'clay',
    '/images/initiative/blocks-1024.webp',
    '/images/initiative/blocks-640.webp 640w, /images/initiative/blocks-1024.webp 1024w',
  ),
  cseb: slot('CSEB block', 'clay'),
  limeCseb: slot('Lime-stabilised CSEB', 'lime'),
  limeMortar: slot('Lime mortar', 'stone'),
  mudConcrete: slot('Lime-stabilised mud concrete', 'soil'),
  limePlaster: slot('Lime plaster', 'lime'),
  story: slot('Our Story — film still', 'earth'),
  ksv: slot(
    'Kanha Shanti Vanam — aerial view of the domed halls and gardens',
    'forest',
    '/images/ksv/aerial-1536.webp',
    '/images/ksv/aerial-960.webp 960w, /images/ksv/aerial-1536.webp 1536w',
  ),
  people: slot('People — working the land', 'forest'),
  places: slot('Places — landscape and lake', 'lake'),
  purpose: slot('Purpose — sapling in earthen hands', 'earth'),
  build: slot('Earthen wall, doorway and plants', 'clay'),
}

export type MediaKey = keyof typeof MEDIA

export const VIDEO: { story?: string } = {
  story: undefined, // the 13 minute film
}
