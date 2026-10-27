import { createRoot } from 'react-dom/client'

// One deployment, two pages, chosen by the address the visitor opened:
//   • the full site (photos, artwork)   heartisanhome.com, and any other address
//   • the basic landing page            the addresses listed in BASIC_HOSTS
// Each page downloads only its own code and styles. `?page=basic` or `?page=site` previews either one anywhere.
const BASIC_HOSTS = ['heartisianhome.vercel.app']

const requested = new URLSearchParams(window.location.search).get('page')
const basic = requested ? requested === 'basic' : BASIC_HOSTS.includes(window.location.hostname)

const root = createRoot(document.getElementById('root')!)

// Two separate import() calls on purpose: the production build attaches each page's stylesheet to its own call,
// and folding them into one expression (`basic ? import(a) : import(b)`) made both pages load the full site's styles.
if (basic) {
  import('./basic/main').then(({ mount }) => mount(root))
} else {
  import('./site/main').then(({ mount }) => mount(root))
}
