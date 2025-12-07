import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedAdmin } from '@/lib/admin'

// GET /api/admin/sellers - Get all sellers with stats
export async function GET() {
  try {
    const auth = await getAuthenticatedAdmin()
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all sellers
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id, shop_name, phone, is_active, created_at')
      .order('created_at', { ascending: false })

    if (sellersError) {
      console.error('Get sellers error:', sellersError)
      return NextResponse.json({ success: false, error: 'database_error' }, { status: 500 })
    }

    // Get order stats per seller
    const { data: orderStats } = await supabase
      .from('orders')
      .select('seller_id, total, status')

    // Calculate stats per seller
    const sellerStats = new Map<string, { orders: number; revenue: number }>()
    orderStats?.forEach(order => {
      const current = sellerStats.get(order.seller_id) || { orders: 0, revenue: 0 }
      if (['confirmed', 'dispatched', 'delivered'].includes(order.status)) {
        current.orders++
        current.revenue += order.total || 0
      }
      sellerStats.set(order.seller_id, current)
    })

    const sellersWithStats = sellers?.map(seller => ({
      id: seller.id,
      shop_name: seller.shop_name,
      phone: seller.phone,
      is_active: seller.is_active,
      created_at: seller.created_at,
      total_orders: sellerStats.get(seller.id)?.orders || 0,
      total_revenue: sellerStats.get(seller.id)?.revenue || 0
    })) || []

    return NextResponse.json({
      success: true,
      sellers: sellersWithStats
    })
  } catch (error) {
    console.error('Admin sellers error:', error)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}
