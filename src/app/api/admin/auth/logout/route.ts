import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function POST() {
  const cookieStore = await cookies()

  // Clear session from database
  const supabase = createServiceRoleClient()
  try {
    await supabase
      .from('admin_settings')
      .update({
        session_token: null,
        session_expires: null
      })
      .eq('id', 'admin')
  } catch {
    // Ignore database errors on logout
  }

  // Clear admin session cookie
  cookieStore.delete('admin_session')

  return NextResponse.json({ success: true })
}
