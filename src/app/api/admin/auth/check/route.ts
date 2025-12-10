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
      // SECURITY: Always return false if we can't verify against database
      console.error('Admin auth check failed:', error?.message || 'No settings found')
      return NextResponse.json({ authenticated: false }, { status: 401 })
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
  } catch (error) {
    // SECURITY: Always return false on any error
    console.error('Admin auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
