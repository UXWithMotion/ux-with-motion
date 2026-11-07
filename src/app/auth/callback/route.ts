import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from '@/lib/auth/redirect'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  const next = safeNextPath(requestUrl.searchParams.get('next'))
  // Use the request origin; never trust an arbitrary forwarded-host header.
  const base = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(new URL(next, base))
    } catch {
      // Network failures follow the same recoverable sign-in error path.
    }
  }

  // Missing code or error during exchange
  return NextResponse.redirect(new URL('/login?error=auth_failed', base))
}
