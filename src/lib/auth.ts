import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export interface AuthenticatedSeller {
  id: string
  phone: string
  shop_name: string | null
  shop_slug: string | null
  onboarding_completed: boolean
}

export interface AuthResult {
  success: boolean
  seller?: AuthenticatedSeller
  error?: string
}

/**
 * Verify the seller session and return seller data
 * Use this in all protected API routes
 */
export async function getAuthenticatedSeller(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const sellerId = cookieStore.get('seller_id')?.value
    const sellerPhone = cookieStore.get('seller_phone')?.value

    if (!sellerId) {
      return { success: false, error: 'no_session' }
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sellerId)) {
      return { success: false, error: 'invalid_session' }
    }

    // Verify seller exists in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: seller, error } = await supabase
      .from('sellers')
      .select('id, phone, shop_name, shop_slug, onboarding_completed, is_active')
      .eq('id', sellerId)
      .single()

    if (error || !seller) {
      return { success: false, error: 'seller_not_found' }
    }

    // Verify the phone matches (additional security layer)
    if (sellerPhone && seller.phone !== sellerPhone) {
      return { success: false, error: 'session_mismatch' }
    }

    // Check if seller is active
    if (!seller.is_active) {
      return { success: false, error: 'account_disabled' }
    }

    return {
      success: true,
      seller: {
        id: seller.id,
        phone: seller.phone,
        shop_name: seller.shop_name,
        shop_slug: seller.shop_slug,
        onboarding_completed: seller.onboarding_completed
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    return { success: false, error: 'auth_error' }
  }
}

/**
 * Clear seller session cookies
 */
export async function clearSellerSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('seller_id')
  cookieStore.delete('seller_phone')
}

// ============================================
// BUYER AUTHENTICATION
// ============================================

export interface AuthenticatedBuyer {
  id: string
  phone: string
  name: string | null
}

export interface BuyerAuthResult {
  success: boolean
  buyer?: AuthenticatedBuyer
  error?: string
}

/**
 * Verify the buyer session and return buyer data
 * Use this in checkout and order-related API routes
 */
export async function getAuthenticatedBuyer(): Promise<BuyerAuthResult> {
  try {
    const cookieStore = await cookies()
    const buyerId = cookieStore.get('buyer_id')?.value
    const buyerPhone = cookieStore.get('buyer_phone')?.value

    if (!buyerId) {
      return { success: false, error: 'no_session' }
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(buyerId)) {
      return { success: false, error: 'invalid_session' }
    }

    // Verify buyer exists in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: buyer, error } = await supabase
      .from('buyers')
      .select('id, phone, name')
      .eq('id', buyerId)
      .single()

    if (error || !buyer) {
      // If buyers table doesn't exist or buyer not found, treat as not logged in
      return { success: false, error: 'buyer_not_found' }
    }

    // Verify the phone matches (additional security layer)
    if (buyerPhone && buyer.phone !== buyerPhone) {
      return { success: false, error: 'session_mismatch' }
    }

    return {
      success: true,
      buyer: {
        id: buyer.id,
        phone: buyer.phone,
        name: buyer.name
      }
    }
  } catch (error) {
    console.error('Buyer auth error:', error)
    return { success: false, error: 'auth_error' }
  }
}

/**
 * Clear buyer session cookies
 */
export async function clearBuyerSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('buyer_id')
  cookieStore.delete('buyer_phone')
}
