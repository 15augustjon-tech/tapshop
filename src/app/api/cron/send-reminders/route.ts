import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendConfirmationReminder, isLineConfigured } from '@/lib/line'

// GET /api/cron/send-reminders - Send confirmation reminders to sellers
// Run this hourly via Vercel Cron or external service
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isLineConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'LINE not configured, skipping reminders',
        sent: 0
      })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current hour in Thailand timezone
    const now = new Date()
    const thaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    const currentHour = thaiTime.getHours()

    // Target hour is 1 hour before shipping
    // If current hour is 13 (1 PM), find sellers with shipping_time = 14:00
    const targetHour = currentHour + 1
    const targetTimeStr = `${targetHour.toString().padStart(2, '0')}:00`

    console.log(`[Cron] Looking for sellers with shipping_time ${targetTimeStr}`)

    // Get day of week for filtering
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const todayDay = dayNames[thaiTime.getDay()]

    // Find sellers whose shipping time is in ~1 hour and have LINE configured
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id, shop_name, line_user_id, shipping_days, shipping_time, last_reminder_sent')
      .eq('is_active', true)
      .eq('shipping_time', targetTimeStr)
      .not('line_user_id', 'is', null)

    if (sellersError) {
      console.error('Get sellers error:', sellersError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!sellers || sellers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sellers to notify at this time',
        sent: 0
      })
    }

    let sentCount = 0
    const today = thaiTime.toISOString().split('T')[0]

    for (const seller of sellers) {
      // Check if today is a shipping day for this seller
      const shippingDays = seller.shipping_days || ['mon', 'tue', 'wed', 'thu', 'fri']
      if (!shippingDays.includes(todayDay)) {
        console.log(`[Cron] Skipping ${seller.shop_name} - not a shipping day`)
        continue
      }

      // Check if we already sent a reminder today
      if (seller.last_reminder_sent && seller.last_reminder_sent.startsWith(today)) {
        console.log(`[Cron] Skipping ${seller.shop_name} - already notified today`)
        continue
      }

      // Count pending orders for this seller scheduled for today
      const { data: pendingOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total')
        .eq('seller_id', seller.id)
        .eq('status', 'pending')
        .eq('scheduled_date', today)

      if (ordersError) {
        console.error(`Get orders error for ${seller.shop_name}:`, ordersError)
        continue
      }

      if (!pendingOrders || pendingOrders.length === 0) {
        console.log(`[Cron] Skipping ${seller.shop_name} - no pending orders`)
        continue
      }

      // Calculate total value
      const totalValue = pendingOrders.reduce((sum, order) => sum + (order.total || 0), 0)

      // Send LINE notification
      try {
        await sendConfirmationReminder(seller.line_user_id!, {
          pendingCount: pendingOrders.length,
          totalValue
        })

        // Update last_reminder_sent
        await supabase
          .from('sellers')
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq('id', seller.id)

        sentCount++
        console.log(`[Cron] Sent reminder to ${seller.shop_name} - ${pendingOrders.length} orders, ?${totalValue}`)
      } catch (lineError) {
        console.error(`LINE notification failed for ${seller.shop_name}:`, lineError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminders`,
      sent: sentCount,
      targetTime: targetTimeStr,
      checkedSellers: sellers.length
    })
  } catch (error) {
    console.error('Cron send-reminders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
