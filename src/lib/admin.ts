// Admin authentication helper
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PHONE = process.env.ADMIN_PHONE || ''

export function isAdminConfigured(): boolean {
  return !!ADMIN_PHONE
}

// Check if seller phone matches admin phone
export function isAdminPhone(phone: string): boolean {
  if (!ADMIN_PHONE) return false
  // Normalize phone formats for comparison
  const normalizedAdmin = ADMIN_PHONE.replace(/\D/g, '').slice(-9)
  const normalizedPhone = phone.replace(/\D/g, '').slice(-9)
  return normalizedAdmin === normalizedPhone
}

// Get authenticated admin from cookies (uses admin_session cookie)
export async function getAuthenticatedAdmin(): Promise<{
  success: boolean
  admin?: { email: string }
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')

    if (!adminSession?.value) {
      return { success: false, error: 'not_authenticated' }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify session against admin_settings table
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('session_token, session_expires')
      .eq('id', 'admin')
      .single()

    if (settingsError || !settings) {
      return { success: false, error: 'invalid_session' }
    }

    // Check token matches
    if (settings.session_token !== adminSession.value) {
      return { success: false, error: 'invalid_session' }
    }

    // Check expiry
    if (settings.session_expires && new Date(settings.session_expires) < new Date()) {
      return { success: false, error: 'session_expired' }
    }

    return {
      success: true,
      admin: { email: process.env.ADMIN_EMAIL || 'admin' }
    }
  } catch {
    return { success: false, error: 'auth_error' }
  }
}
