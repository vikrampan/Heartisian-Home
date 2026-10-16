export const NAV = [
  { label: 'Home', footerLabel: 'Home', href: '#hero' },
  { label: 'About', footerLabel: 'About', href: '#initiative' },
  { label: 'The Craft', footerLabel: 'The Craft', href: '#craft' },
  { label: 'KSV', footerLabel: 'Kanha Shanti Vanam', href: '#ksv' },
  { label: 'Our Vision', footerLabel: 'Our Vision', href: '#difference' },
  { label: 'The Journey', footerLabel: 'The Journey', href: '#journey' },
  { label: 'Contact', footerLabel: 'Contact', href: '#footer' },
] as const

// Page sections in scroll order, each mapped to the nav item it highlights.
export const SECTIONS = [
  { id: 'hero', nav: 0 },
  { id: 'initiative', nav: 1 },
  { id: 'craft', nav: 2 },
  { id: 'story', nav: 2 },
  { id: 'difference', nav: 4 },
  { id: 'ksv', nav: 3 },
  { id: 'journey', nav: 5 },
  { id: 'people', nav: 5 },
  { id: 'build', nav: 5 },
  { id: 'footer', nav: 6 },
] as const

export const SECTION_IDS = SECTIONS.map((section) => section.id)

export const TECHNIQUES = [
  { id: 'cseb', name: 'CSEB', description: 'Compressed Stabilised Earth Blocks' },
  { id: 'limeCseb', name: 'Lime-stabilised CSEB', description: 'Stronger. Greener. Longer lasting.' },
  { id: 'limeMortar', name: 'Lime mortar', description: 'Natural bonding. Natural beauty.' },
  { id: 'mudConcrete', name: 'Lime-stabilised mud concrete', description: 'Earth with strength.' },
  { id: 'limePlaster', name: 'Lime plaster', description: 'Breathable walls. Healthier spaces.' },
] as const

export type TechniqueId = (typeof TECHNIQUES)[number]['id']

export const PILLARS = [
  { icon: 'sprout', title: 'Ecology', description: 'Building with natural and locally appropriate materials.' },
  {
    icon: 'book',
    title: 'Learning',
    description: 'Creating practical skills and opportunities for skilled and unskilled workers.',
  },
  { icon: 'lotus', title: 'Meditation', description: 'A setting centred around meditation and inner development.' },
  {
    icon: 'people',
    title: 'Conscious Living',
    description: 'A substance-free environment that encourages healthier and more purposeful ways of living.',
  },
] as const

export const JOURNEY_STEPS = [
  { icon: 'learn', title: 'Learn', caption: 'Hands-on training and knowledge' },
  { icon: 'train', title: 'Train', caption: 'Skills and opportunities' },
  { icon: 'build', title: 'Build', caption: 'Practical construction' },
  { icon: 'scale', title: 'Scale', caption: 'Larger impact through SKIL' },
] as const

export const PEOPLE_CARDS = [
  { id: 'people', title: 'People', subtitle: 'The hands behind the homes.' },
  { id: 'places', title: 'Places', subtitle: 'Inspired by the land, shaped by its stories.' },
  { id: 'purpose', title: 'Purpose', subtitle: 'We collaborate with Nature.' },
] as const
