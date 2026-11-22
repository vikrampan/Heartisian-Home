import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Local development: answers /api/* with the same code Vercel runs (see dev/api-dev.ts).
function workshopsApi(): Plugin {
  return {
    name: 'workshops-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // only the routes; the browser also loads shared helpers from /api/_lib/ as source files
        if (!/^\/api\/(workshops|register|booking|admin|cron|dev-login)(\?|\/?$)/.test(req.url ?? '')) return next()
        server
          .ssrLoadModule('/dev/api-dev.ts')
          .then((mod) => (mod as typeof import('./dev/api-dev.ts')).serve(req, res))
          .catch((error: unknown) => {
            console.error('[dev api]', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(error) }))
          })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // server-side keys in .env.local (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY…) for the local /api routes
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), workshopsApi()],
    // the local workshops database and saved emails change while the site runs; they are not site files
    server: { watch: { ignored: ['**/.dev-db/**', '**/.dev-mail/**'] } },
  }
})
