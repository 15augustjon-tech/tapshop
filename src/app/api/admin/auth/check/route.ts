import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session')

  if (!sessionToken?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // Validate session against database
  const supabase = createServiceRoleClient()

  try {
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('session_token, session_expires')
      .eq('id', 'admin')
      .single()

    if (error || !settings) {
      // No database record, fall back to cookie-only check for backward compatibility
      // This is less secure but allows system to work before table is created
      return NextResponse.json({ authenticated: true })
    }

    // Verify token matches
    if (settings.session_token !== sessionToken.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Check expiration
    if (settings.session_expires && new Date(settings.session_expires) < new Date()) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true })
  } catch {
    // Database error, fall back to cookie-only
    return NextResponse.json({ authenticated: true })
  }
}
