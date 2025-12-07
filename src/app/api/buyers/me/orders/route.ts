import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedBuyer } from '@/lib/auth'

// GET /api/buyers/me/orders - Get buyer's order history
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedBuyer()

    if (!auth.success || !auth.buyer) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get orders with seller info
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total,
        scheduled_date,
        scheduled_time,
        created_at,
        seller_id
      `, { count: 'exact' })
      .eq('buyer_id', auth.buyer.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (ordersError) {
      console.error('Get orders error:', ordersError)
      return NextResponse.json(
        { success: false, error: 'db_error', message: 'เกิดข้อผิดพลาด' },
        { status: 500 }
      )
    }

    // Get seller info for each order
    const sellerIds = [...new Set(orders?.map(o => o.seller_id) || [])]
    let sellersMap: Record<string, { shop_name: string; shop_slug: string }> = {}

    if (sellerIds.length > 0) {
      const { data: sellers } = await supabase
        .from('sellers')
        .select('id, shop_name, shop_slug')
        .in('id', sellerIds)

      if (sellers) {
        sellersMap = Object.fromEntries(sellers.map(s => [s.id, { shop_name: s.shop_name, shop_slug: s.shop_slug }]))
      }
    }

    // Status text mapping
    const statusText: Record<string, string> = {
      pending: 'รอยืนยัน',
      confirmed: 'ยืนยันแล้ว',
      preparing: 'กำลังเตรียมของ',
      dispatched: 'ไรเดอร์รับของแล้ว',
      picked_up: 'กำลังจัดส่ง',
      delivered: 'ส่งแล้ว',
      cancelled: 'ยกเลิก'
    }

    const ordersWithSeller = orders?.map(order => ({
      ...order,
      status_text: statusText[order.status] || order.status,
      seller: sellersMap[order.seller_id] || null
    })) || []

    return NextResponse.json({
      success: true,
      orders: ordersWithSeller,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get buyer orders error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
