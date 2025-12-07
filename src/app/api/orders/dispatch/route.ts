import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'
import { getQuote, createOrder, isLalamoveConfigured, LalamoveError } from '@/lib/lalamove'

interface DispatchResult {
  orderId: string
  orderNumber: string
  success: boolean
  error?: string
  lalamoveOrderId?: string
  shareLink?: string
}

// POST /api/orders/dispatch - Book Lalamove deliveries for confirmed orders
export async function POST(request: NextRequest) {
  try {
    // Verify seller authentication
    const auth = await getAuthenticatedSeller()
    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const { orderIds } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'invalid_request', message: 'กรุณาเลือกคำสั่งซื้อ' },
        { status: 400 }
      )
    }

    // Check if Lalamove is configured
    if (!isLalamoveConfigured()) {
      return NextResponse.json(
        { success: false, error: 'lalamove_not_configured', message: 'ยังไม่ได้ตั้งค่า Lalamove' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get seller details for pickup info
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, shop_name, phone, pickup_address, pickup_lat, pickup_lng')
      .eq('id', auth.seller.id)
      .single()

    if (sellerError || !seller) {
      return NextResponse.json(
        { success: false, error: 'seller_not_found', message: 'ไม่พบข้อมูลร้านค้า' },
        { status: 404 }
      )
    }

    if (!seller.pickup_lat || !seller.pickup_lng) {
      return NextResponse.json(
        { success: false, error: 'no_pickup_location', message: 'กรุณาตั้งค่าที่อยู่รับสินค้าก่อน' },
        { status: 400 }
      )
    }

    // Get orders that belong to this seller and are in confirmed status
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .in('id', orderIds)
      .eq('seller_id', auth.seller.id)
      .eq('status', 'confirmed')

    if (ordersError) {
      console.error('Get orders error:', ordersError)
      return NextResponse.json(
        { success: false, error: 'orders_error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'no_orders', message: 'ไม่พบคำสั่งซื้อที่พร้อมจัดส่ง' },
        { status: 400 }
      )
    }

    const results: DispatchResult[] = []

    // Process each order
    for (const order of orders) {
      try {
        // Get fresh Lalamove quote
        const quote = await getQuote(
          seller.pickup_lat,
          seller.pickup_lng,
          seller.pickup_address || seller.shop_name,
          order.buyer_lat,
          order.buyer_lng,
          order.buyer_address
        )

        // Create Lalamove order with COD amount
        const lalamoveOrder = await createOrder(
          quote.quotationId,
          seller.shop_name,
          seller.phone,
          order.buyer_name,
          order.buyer_phone,
          order.total, // COD amount = total order value
          order.buyer_notes
        )

        // Create delivery record
        const { error: deliveryError } = await supabase
          .from('deliveries')
          .insert({
            order_id: order.id,
            lalamove_order_id: lalamoveOrder.orderId,
            lalamove_share_link: lalamoveOrder.shareLink,
            status: 'booked',
            delivery_fee: quote.fee,
            cod_amount: order.total
          })

        if (deliveryError) {
          console.error('Create delivery error:', deliveryError)
        }

        // Update order status to dispatched
        await supabase
          .from('orders')
          .update({
            status: 'dispatched',
            delivery_fee: quote.fee, // Update with actual Lalamove fee
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        results.push({
          orderId: order.id,
          orderNumber: order.order_number,
          success: true,
          lalamoveOrderId: lalamoveOrder.orderId,
          shareLink: lalamoveOrder.shareLink
        })

      } catch (error) {
        console.error(`Dispatch order ${order.order_number} failed:`, error)

        const errorMessage = error instanceof LalamoveError
          ? error.message
          : 'ไม่สามารถจองการจัดส่งได้'

        // Mark order as failed
        await supabase
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        results.push({
          orderId: order.id,
          orderNumber: order.order_number,
          success: false,
          error: errorMessage
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: failCount === 0,
      message: `จองการจัดส่งสำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ''}`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      }
    })
  } catch (error) {
    console.error('Dispatch orders error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
