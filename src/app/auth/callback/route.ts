import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getTrustedForwardedHost(request: Request): string | null {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (!forwardedHost) return null
  const host = forwardedHost.split(',')[0].trim().toLowerCase()
  if (
    host === 'uxwithmotion.com' ||
    host.endsWith('.uxwithmotion.com') ||
    host.endsWith('.vercel.app') ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')
  ) {
    return host
  }
  return null
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Prevent open redirects: only allow absolute internal paths starting with / (disallow // and backslashes)
  let next = requestUrl.searchParams.get('next') ?? '/'
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    next = '/'
  }
  
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const trustedHost = getTrustedForwardedHost(request)
  const base = (!isLocalEnv && trustedHost) ? `https://${trustedHost}` : requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, base))
    }
  }

  // Missing code or error during exchange
  return NextResponse.redirect(new URL('/login?error=auth_failed', base))
}
