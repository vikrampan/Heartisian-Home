import { handle } from './_lib/core.js'
import { prodDeps } from './_lib/prod.js'

export const GET = (req: Request) => handle('booking', req, prodDeps)
export const POST = (req: Request) => handle('booking', req, prodDeps)
