import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedAdmin } from '@/lib/admin'

// GET /api/admin/stats - Get admin dashboard stats
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

    // Get today's date in Thailand timezone
    const now = new Date()
    const thaiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    const todayStart = new Date(thaiDate.getFullYear(), thaiDate.getMonth(), thaiDate.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    // Orders today
    const { count: ordersToday } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString())

    // Revenue today
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString())
      .in('status', ['confirmed', 'dispatched', 'delivered'])

    const revenueToday = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Failed deliveries
    const { count: failedDeliveries } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')

    // All time stats
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total, status')

    const deliveredOrders = allOrders?.filter(o =>
      ['confirmed', 'dispatched', 'delivered'].includes(o.status)
    ) || []

    const totalOrdersAllTime = deliveredOrders.length
    const totalRevenueAllTime = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const ourCut = totalOrdersAllTime * 40 // COD fee (฿40 per order)

    return NextResponse.json({
      success: true,
      stats: {
        ordersToday: ordersToday || 0,
        revenueToday,
        pendingOrders: pendingOrders || 0,
        failedDeliveries: failedDeliveries || 0,
        totalOrdersAllTime,
        totalRevenueAllTime,
        ourCut
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}
