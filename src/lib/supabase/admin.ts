import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-user'

export async function requireAdmin() {
  const { user, supabase } = await requireUser('/admin', '/admin/login')

  // Check for admin role in the user_roles table
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || !roleData || roleData.role !== 'admin') {
    // Authenticated but not admin
    redirect('/admin/login?error=unauthorized')
  }

  return { user, supabase }
}
