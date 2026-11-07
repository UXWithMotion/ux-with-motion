import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safeNextPath } from './redirect'

/** Verify identity at each protected data/action boundary, not just in a layout. */
export async function requireUser(next = '/', loginPath: '/login' | '/admin/login' = '/login') {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect(`${loginPath}?next=${encodeURIComponent(safeNextPath(next))}`)
  }
  return { user, supabase }
}
