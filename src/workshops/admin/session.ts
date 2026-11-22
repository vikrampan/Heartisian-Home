import type { SupabaseClient } from '@supabase/supabase-js'
import { ApiError, post } from '../lib'

// Admin sign-in. Live: Supabase Auth (email and password), with the Supabase library loaded only here.
// Local development without Supabase keys: a stand-in sign-in (any email, password "dev").

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const authMode: 'supabase' | 'dev' | 'missing' = URL_ && ANON ? 'supabase' : import.meta.env.DEV ? 'dev' : 'missing'

const DEV_KEY = 'heartisan-admin-dev'
let client: Promise<SupabaseClient> | null = null

export function supabase() {
  client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL_ as string, ANON as string))
  return client
}

export async function currentToken(): Promise<string | null> {
  if (authMode === 'dev') return sessionStorage.getItem(DEV_KEY)
  if (authMode !== 'supabase') return null
  const { data } = await (await supabase()).auth.getSession()
  return data.session?.access_token ?? null
}

export async function signIn(email: string, password: string) {
  if (authMode === 'dev') {
    if (password !== 'dev') throw new Error('Locally, the password is "dev".')
    const { token } = await post<{ token: string }>('dev-login', {})
    sessionStorage.setItem(DEV_KEY, token)
    return
  }
  const { error } = await (await supabase()).auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'That email and password do not match.' : error.message)
}

export async function signOut() {
  if (authMode === 'dev') sessionStorage.removeItem(DEV_KEY)
  else if (authMode === 'supabase') await (await supabase()).auth.signOut()
}

export async function sendReset(email: string) {
  const { error } = await (await supabase()).auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` })
  if (error) throw new Error(error.message)
}

export async function setPassword(password: string) {
  const { error } = await (await supabase()).auth.updateUser({ password })
  if (error) throw new Error(error.message)
}

/** Calls an admin action on the server with the signed-in admin's token. */
export async function admin<T>(action: string, payload: object = {}): Promise<T> {
  const token = await currentToken()
  if (!token) throw new ApiError('Please sign in again.', 401)
  return post<T>('admin', { action, ...payload }, { authorization: `Bearer ${token}` })
}

/** Uploads a photo, shrunk to at most 1600px wide, and returns its address. */
export async function uploadPhoto(file: File, kind: 'cover' | 'trainer'): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const target = await admin<{ path: string; token: string; publicUrl: string } | { inline: true }>('upload_target', { kind, ext: 'webp' })
  if ('inline' in target) return canvas.toDataURL('image/webp', 0.82)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read that image.'))), 'image/webp', 0.82),
  )
  const { error } = await (await supabase()).storage.from('media').uploadToSignedUrl(target.path, target.token, blob, { contentType: 'image/webp' })
  if (error) throw new Error(error.message)
  return target.publicUrl
}
