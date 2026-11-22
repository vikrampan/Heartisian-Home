import { handle } from './_lib/core.js'
import { prodDeps } from './_lib/prod.js'

export const GET = (req: Request) => handle('cron', req, prodDeps)
