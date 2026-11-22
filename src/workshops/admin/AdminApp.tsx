import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { LogoFull } from '../../site/components/art'
import { ApiError, navigate, onLinkClick, useTitle } from '../lib'
import { Spinner } from '../ui'
import { Field, Input, Note } from './kit'
import { BTN_PLAIN, BTN_PRIMARY } from './util'
import Overview from './Overview'
import Participants from './Participants'
import Settings from './Settings'
import Trainers from './Trainers'
import WorkshopEditor from './WorkshopEditor'
import WorkshopList from './WorkshopList'
import { admin, authMode, currentToken, sendReset, setPassword, signIn, signOut, supabase } from './session'

type State = { kind: 'checking' } | { kind: 'out'; message?: string } | { kind: 'recovery' } | { kind: 'in'; email: string }

export default function AdminApp({ path }: { path: string[] }) {
  useTitle('Workshops admin — Heartisan Home')
  const [state, setState] = useState<State>({ kind: 'checking' })

  useEffect(() => {
    // private pages: keep them out of search engines
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  async function check() {
    if (!(await currentToken())) return setState({ kind: 'out' })
    try {
      const { email } = await admin<{ email: string }>('me')
      setState({ kind: 'in', email })
    } catch (e) {
      const err = e as ApiError
      if (err.status === 401) {
        await signOut()
        setState({ kind: 'out', message: 'This account is not on the admin list. Ask an admin to add your email in Settings.' })
      } else setState({ kind: 'out', message: err.message })
    }
  }

  useEffect(() => {
    if (authMode === 'missing') return
    let unsubscribe = () => {}
    if (authMode === 'supabase') {
      supabase().then((sb) => {
        const { data } = sb.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') setState({ kind: 'recovery' })
        })
        unsubscribe = () => data.subscription.unsubscribe()
      })
    }
    // a password-reset link lands here with a recovery token in the address
    // oxlint-disable-next-line react/set-state-in-effect -- check() waits for the sign-in before changing state
    if (!window.location.hash.includes('type=recovery')) check()
    return () => unsubscribe()
  }, [])

  if (authMode === 'missing') {
    return (
      <Frame>
        <Note tone="info">
          The admin is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel's environment
          variables and redeploy.
        </Note>
      </Frame>
    )
  }
  if (state.kind === 'checking') {
    return (
      <Frame>
        <p className="flex items-center gap-2.5 text-muted"><Spinner /> Checking your sign-in…</p>
      </Frame>
    )
  }
  if (state.kind === 'recovery') return <Recovery onDone={check} />
  if (state.kind === 'out') return <SignIn message={state.message} onIn={check} />

  return (
    <Shell email={state.email} path={path} onSignOut={async () => { await signOut(); setState({ kind: 'out' }) }}>
      <Screen path={path} email={state.email} />
    </Shell>
  )
}

function Screen({ path, email }: { path: string[]; email: string }) {
  const [a, b, c] = path
  if (!a) return <Overview />
  if (a === 'workshops' && !b) return <WorkshopList />
  if (a === 'workshops' && b === 'new') return <WorkshopEditor />
  if (a === 'workshops' && b && c === 'participants') return <Participants workshopId={b} />
  if (a === 'workshops' && b) return <WorkshopEditor key={b} id={b} />
  if (a === 'trainers') return <Trainers />
  if (a === 'settings') return <Settings email={email} />
  return <Overview />
}

const NAV = [
  ['Overview', '/admin'],
  ['Workshops', '/admin/workshops'],
  ['Trainers', '/admin/trainers'],
  ['Settings', '/admin/settings'],
] as const

function Shell({ email, path, onSignOut, children }: { email: string; path: string[]; onSignOut: () => void; children: ReactNode }) {
  const current = `/admin${path[0] ? `/${path[0]}` : ''}`
  return (
    <div className="min-h-screen bg-[#f6f1e8]">
      <header className="moss sticky top-0 z-40 text-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="/admin" onClick={onLinkClick} className="flex items-center gap-2.5">
            <span className="rounded-full bg-paper p-0.5">
              <LogoFull eager sizes="2.75rem" className="h-11 w-11" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold uppercase tracking-[0.12em]">Heartisan Home</span>
              <span className="block text-xs text-paper/70">Workshops admin</span>
            </span>
          </a>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-paper/70 md:inline">{email}</span>
            <button type="button" onClick={onSignOut} className="rounded-full px-3 py-1.5 text-paper/85 ring-1 ring-paper/25 hover:bg-paper/10">
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Admin" className="border-t border-paper/10">
          <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4">
            {NAV.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={onLinkClick}
                  aria-current={current === href ? 'page' : undefined}
                  className="block whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm text-paper/75 hover:text-paper aria-[current=page]:border-clay aria-[current=page]:text-paper"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="ml-auto">
              <a href="/workshops" onClick={onLinkClick} className="block whitespace-nowrap px-3 py-2.5 text-sm text-paper/60 hover:text-paper">
                View the website
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="content" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="paper flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-[0_30px_60px_-34px_rgb(43_38_32/0.6)] ring-1 ring-ink/8">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoFull eager sizes="6rem" className="h-24 w-24" />
          <p className="mt-3 font-display text-2xl text-ink">Workshops admin</p>
        </div>
        {children}
      </div>
    </div>
  )
}

function SignIn({ message, onIn }: { message?: string; onIn: () => void }) {
  const [email, setEmail] = useState(authMode === 'dev' ? 'dev@localhost' : '')
  const [password, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState(message ?? '')
  const [resetSent, setResetSent] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setProblem('')
    try {
      await signIn(email.trim(), password)
      onIn()
    } catch (err) {
      setProblem((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Frame>
      <form onSubmit={submit} className="space-y-4">
        {authMode === 'dev' && <Note tone="info">Local preview: sign in with the password "dev".</Note>}
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
        </Field>
        {problem && <Note>{problem}</Note>}
        {resetSent && <Note tone="ok">If that email has an account, a link to set a new password is on its way.</Note>}
        <button type="submit" disabled={busy} className={`${BTN_PRIMARY} h-11 w-full`}>
          {busy && <Spinner className="h-4 w-4" />} Sign in
        </button>
        {authMode === 'supabase' && (
          <button
            type="button"
            onClick={async () => {
              if (!email.trim()) return setProblem('Enter your email first.')
              try {
                await sendReset(email.trim())
                setResetSent(true)
              } catch (err) {
                setProblem((err as Error).message)
              }
            }}
            className="w-full text-center text-sm font-semibold text-terracotta underline-offset-4 hover:underline"
          >
            Forgot your password?
          </button>
        )}
      </form>
    </Frame>
  )
}

function Recovery({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('')
  const [problem, setProblem] = useState('')
  return (
    <Frame>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (pw.length < 10) return setProblem('Use at least 10 characters.')
          try {
            await setPassword(pw)
            navigate('/admin', { replace: true })
            onDone()
          } catch (err) {
            setProblem((err as Error).message)
          }
        }}
        className="space-y-4"
      >
        <Field label="Choose a new password" hint="At least 10 characters.">
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
        </Field>
        {problem && <Note>{problem}</Note>}
        <button type="submit" className={`${BTN_PRIMARY} h-11 w-full`}>Save and sign in</button>
        <a href="/admin" className={`${BTN_PLAIN} h-11 w-full`}>Cancel</a>
      </form>
    </Frame>
  )
}
