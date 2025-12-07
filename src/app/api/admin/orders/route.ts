import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedAdmin } from '@/lib/admin'

// GET /api/admin/orders - Get all orders with filters
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin()
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sellerId = searchParams.get('seller')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '100')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_name,
        buyer_phone,
        total,
        status,
        created_at,
        sellers(shop_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }
    if (sellerId) {
      query = query.eq('seller_id', sellerId)
    }
    if (from) {
      query = query.gte('created_at', from)
    }
    if (to) {
      query = query.lte('created_at', to)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Get orders error:', error)
      return NextResponse.json({ success: false, error: 'database_error' }, { status: 500 })
    }

    // Flatten seller info
    const flattenedOrders = orders?.map(order => {
      // Handle sellers - can be object or null depending on join
      const sellers = order.sellers as { shop_name: string } | { shop_name: string }[] | null
      const shopName = Array.isArray(sellers)
        ? sellers[0]?.shop_name
        : sellers?.shop_name

      return {
        id: order.id,
        order_number: order.order_number,
        shop_name: shopName || 'Unknown',
        buyer_name: order.buyer_name,
        buyer_phone: order.buyer_phone,
        total: order.total,
        status: order.status,
        created_at: order.created_at
      }
    }) || []

    return NextResponse.json({
      success: true,
      orders: flattenedOrders
    })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}
