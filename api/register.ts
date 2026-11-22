import { handle } from './_lib/core.js'
import { prodDeps } from './_lib/prod.js'

export const POST = (req: Request) => handle('register', req, prodDeps)
