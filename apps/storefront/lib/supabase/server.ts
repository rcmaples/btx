import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options))
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    },
  )
}

// Server-side auth utilities for fast, non-blocking auth checks
export async function getServerAuth() {
  const supabase = await createClient()

  // getSession() is fast - reads from cookie, no API call
  const {
    data: {session},
  } = await supabase.auth.getSession()

  return {
    supabase,
    user: session?.user ?? null,
    session,
  }
}

// Lightweight auth check without profile fetching
export async function getUser() {
  const {user} = await getServerAuth()
  return user
}
