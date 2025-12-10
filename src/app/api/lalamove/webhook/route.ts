import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'
import { LALAMOVE_STATUS_MAP, LALAMOVE_TO_ORDER_STATUS } from '@/lib/lalamove'
import {
  sendDriverAssignedNotification,
  sendDeliveryCompletedNotification,
  sendDeliveryFailedNotification,
  isLineConfigured
} from '@/lib/line'

// Lalamove webhook payload
interface LalamoveWebhookPayload {
  data: {
    orderId: string
    status: string
    driver?: {
      name: string
      phone: string
      plateNumber: string
    }
  }
}

// Verify Lalamove webhook signature
function verifyLalamoveSignature(body: string, signature: string | null): boolean {
  // SECURITY: Never skip verification - require API secret
  const secret = process.env.LALAMOVE_API_SECRET
  if (!secret) {
    console.error('[Lalamove Webhook] SECURITY: No API secret configured - rejecting request')
    return false
  }

  if (!signature) {
    console.error('[Lalamove Webhook] Missing signature header')
    return false
  }

  // Lalamove uses HMAC-SHA256
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  // Compare signatures (timing-safe comparison)
  if (signature.length !== expectedSignature.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }

  return result === 0
}

// POST /api/lalamove/webhook - Handle Lalamove status updates
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('X-LLM-Signature')

    // Verify signature
    if (!verifyLalamoveSignature(rawBody, signature)) {
      console.error('[Lalamove Webhook] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const body: LalamoveWebhookPayload = JSON.parse(rawBody)
    const { orderId, status, driver } = body.data

    console.log(`[Lalamove Webhook] Order: ${orderId}, Status: ${status}`, driver ? `Driver: ${driver.name}` : '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find delivery by lalamove_order_id with seller info for LINE notifications
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select(`
        *,
        orders(
          id,
          order_number,
          seller_id,
          buyer_name,
          buyer_phone,
          total,
          sellers(
            id,
            line_user_id
          )
        )
      `)
      .eq('lalamove_order_id', orderId)
      .single()

    if (deliveryError || !delivery) {
      console.error('Delivery not found for Lalamove order:', orderId)
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Map Lalamove status to our delivery status
    const deliveryStatus = LALAMOVE_STATUS_MAP[status] || status.toLowerCase()

    // Build update object for delivery
    const deliveryUpdate: Record<string, unknown> = {
      status: deliveryStatus,
      updated_at: new Date().toISOString()
    }

    // Add driver info if available
    if (driver) {
      deliveryUpdate.driver_name = driver.name
      deliveryUpdate.driver_phone = driver.phone
      deliveryUpdate.driver_plate = driver.plateNumber
    }

    // Add timestamps for specific statuses
    if (status === 'PICKED_UP') {
      deliveryUpdate.picked_up_at = new Date().toISOString()
    }
    if (status === 'COMPLETED') {
      deliveryUpdate.delivered_at = new Date().toISOString()
    }

    // Update delivery record
    const { error: updateDeliveryError } = await supabase
      .from('deliveries')
      .update(deliveryUpdate)
      .eq('id', delivery.id)

    if (updateDeliveryError) {
      console.error('Failed to update delivery:', updateDeliveryError)
    }

    // Update order status if applicable
    const orderStatus = LALAMOVE_TO_ORDER_STATUS[status]
    if (orderStatus && delivery.orders) {
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', delivery.order_id)

      if (updateOrderError) {
        console.error('Failed to update order status:', updateOrderError)
      }
    }

    // Send LINE notifications for important events
    const order = delivery.orders as {
      id: string
      order_number: string
      seller_id: string
      total: number
      sellers: { id: string; line_user_id: string | null } | null
    } | null
    const lineUserId = order?.sellers?.line_user_id

    if (lineUserId && isLineConfigured()) {
      try {
        // Driver assigned notification
        if (status === 'ON_GOING' && driver) {
          await sendDriverAssignedNotification(lineUserId, {
            orderNumber: order.order_number,
            driverName: driver.name,
            driverPhone: driver.phone,
            shareLink: delivery.lalamove_share_link || undefined
          })
        }

        // Delivery completed notification
        if (status === 'COMPLETED') {
          await sendDeliveryCompletedNotification(lineUserId, {
            orderNumber: order.order_number,
            earnings: order.total // Seller earnings = order total (COD collected)
          })
        }

        // Delivery failed notification
        if (status === 'CANCELED' || status === 'REJECTED') {
          await sendDeliveryFailedNotification(lineUserId, {
            orderNumber: order.order_number,
            reason: status === 'CANCELED' ? 'ยกเลิกโดยผู้ใช้' : 'ไรเดอร์ปฏิเสธงาน'
          })
        }
      } catch (lineError) {
        console.error('LINE notification failed (non-critical):', lineError)
      }
    }

    // Log for debugging
    console.log(`[Lalamove Webhook] Updated delivery ${delivery.id} to status: ${deliveryStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lalamove webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification (some services require this)
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'lalamove-webhook' })
}
