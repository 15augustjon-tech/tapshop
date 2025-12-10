import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const sellerId = auth.seller.id

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Initialize defaults
    let total_earnings = 0
    let total_orders = 0
    let pending_orders = 0
    let total_products = 0

    try {
      // Get total earnings from delivered orders
      const { data: earningsData, error: earningsError } = await supabase
        .from('orders')
        .select('subtotal')
        .eq('seller_id', sellerId)
        .eq('status', 'delivered')

      if (!earningsError) {
        total_earnings = earningsData?.reduce((sum, order) => sum + Number(order.subtotal), 0) || 0
      }

      // Get total orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)

      if (!ordersError) {
        total_orders = ordersCount || 0
      }

      // Get pending orders count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .eq('status', 'pending')

      if (!pendingError) {
        pending_orders = pendingCount || 0
      }

      // Get total products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)

      if (!productsError) {
        total_products = productsCount || 0
      }
    } catch (e) {
      // Tables might not exist yet, return defaults
      console.log('Stats query error (tables may not exist):', e)
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_earnings,
        total_orders,
        pending_orders,
        total_products
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
