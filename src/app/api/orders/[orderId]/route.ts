import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/orders/[orderId] - Get order details (public by order ID - UUIDs are secure enough)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Validate UUID format
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: 'รหัสคำสั่งซื้อไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get order with seller info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        seller:sellers(
          id,
          shop_name,
          shop_slug,
          phone
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบคำสั่งซื้อ' },
        { status: 404 }
      )
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('id, product_id, product_name, price, quantity')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Get order items error:', itemsError)
    }

    // Get delivery info if exists
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single()

    // Format status for Thai display
    const statusMap: Record<string, string> = {
      pending: 'รอยืนยัน',
      confirmed: 'ยืนยันแล้ว',
      preparing: 'กำลังเตรียมสินค้า',
      dispatched: 'ไรเดอร์รับของแล้ว',
      picked_up: 'กำลังจัดส่ง',
      delivered: 'ส่งแล้ว',
      cancelled: 'ยกเลิก'
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        status_text: statusMap[order.status] || order.status,
        buyer_name: order.buyer_name,
        buyer_phone: order.buyer_phone,
        buyer_address: order.buyer_address,
        buyer_notes: order.buyer_notes,
        subtotal: order.subtotal,
        delivery_fee: order.delivery_fee,
        cod_fee: order.cod_fee,
        total: order.total,
        scheduled_date: order.scheduled_date,
        scheduled_time: order.scheduled_time,
        created_at: order.created_at,
        updated_at: order.updated_at,
        seller: order.seller,
        items: items || [],
        delivery: delivery || null
      }
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
