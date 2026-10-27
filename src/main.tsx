import { createRoot } from 'react-dom/client'

// One deployment, two pages, chosen by the address the visitor opened:
//   • the full site (photos, artwork)   heartisanhome.com, and any other address
//   • the basic landing page            the addresses listed in BASIC_HOSTS
// Each page downloads only its own code and styles. `?page=basic` or `?page=site` previews either one anywhere.
const BASIC_HOSTS = ['heartisianhome.vercel.app']

const requested = new URLSearchParams(window.location.search).get('page')
const basic = requested ? requested === 'basic' : BASIC_HOSTS.includes(window.location.hostname)

const root = createRoot(document.getElementById('root')!)
const load = basic ? import('./basic/main') : import('./site/main')
load.then(({ mount }) => mount(root))
