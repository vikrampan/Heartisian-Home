import { handle } from './_lib/core.js'
import { prodDeps } from './_lib/prod.js'

// Link previews for WhatsApp, Facebook, LinkedIn and X (see vercel.json and preview() in _lib/core.ts).
export const GET = (req: Request) => handle('preview', req, prodDeps)
