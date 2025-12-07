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

// Get authenticated admin from cookies (uses seller auth)
export async function getAuthenticatedAdmin(): Promise<{
  success: boolean
  seller?: { id: string; phone: string; shop_name: string }
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const sellerSession = cookieStore.get('seller_session')

    if (!sellerSession?.value) {
      return { success: false, error: 'not_authenticated' }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify session
    const { data: session, error: sessionError } = await supabase
      .from('seller_sessions')
      .select('seller_id, expires_at')
      .eq('token', sellerSession.value)
      .single()

    if (sessionError || !session) {
      return { success: false, error: 'invalid_session' }
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      return { success: false, error: 'session_expired' }
    }

    // Get seller info
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, phone, shop_name')
      .eq('id', session.seller_id)
      .single()

    if (sellerError || !seller) {
      return { success: false, error: 'seller_not_found' }
    }

    // Check if admin
    if (!isAdminPhone(seller.phone)) {
      return { success: false, error: 'not_admin' }
    }

    return { success: true, seller }
  } catch {
    return { success: false, error: 'auth_error' }
  }
}
