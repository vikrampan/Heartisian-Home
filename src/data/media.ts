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
  initiative: slot(
    'Stacked compressed earth blocks in warm sunlight',
    'clay',
    '/images/initiative/blocks-1024.webp',
    '/images/initiative/blocks-640.webp 640w, /images/initiative/blocks-1024.webp 1024w',
  ),
  cseb: slot('Two stacked compressed stabilised earth blocks', 'clay', '/images/craft/cseb.webp'),
  limeCseb: slot('Two stacked lime-stabilised earth blocks', 'lime', '/images/craft/lime-cseb.webp'),
  limeMortar: slot('Mixing lime mortar in a tub with a trowel', 'stone', '/images/craft/lime-mortar.webp'),
  mudConcrete: slot('A polished lime-stabilised mud concrete floor beside a timber post', 'soil', '/images/craft/mud-concrete.webp'),
  limePlaster: slot('Smoothing lime plaster onto a wall with a steel trowel', 'lime', '/images/craft/lime-plaster.webp'),
  story: slot('The porch of an earthen Heartisan home, with lanterns and a carved wooden door', 'earth', '/images/story/porch.webp'),
  ksv: slot(
    'Kanha Shanti Vanam — aerial view of the domed halls and gardens',
    'forest',
    '/images/ksv/aerial-1536.webp',
    '/images/ksv/aerial-960.webp 960w, /images/ksv/aerial-1536.webp 1536w',
  ),
  people: slot(
    'The Heartisan Home team in front of an earthen building',
    'forest',
    '/images/ppp/people-1600.webp',
    '/images/ppp/people-960.webp 960w, /images/ppp/people-1600.webp 1600w',
  ),
  places: slot(
    'A forest trail beside a lake in golden light',
    'lake',
    '/images/ppp/places-1075.webp',
    '/images/ppp/places-640.webp 640w, /images/ppp/places-1075.webp 1075w',
  ),
  purpose: slot(
    'A bathroom built around a living tree, open to the sky',
    'earth',
    '/images/ppp/purpose-1086.webp',
    '/images/ppp/purpose-640.webp 640w, /images/ppp/purpose-1086.webp 1086w',
  ),
}

export type MediaKey = keyof typeof MEDIA

export const VIDEO: { story?: string } = {
  story: undefined, // the 13 minute film
}
