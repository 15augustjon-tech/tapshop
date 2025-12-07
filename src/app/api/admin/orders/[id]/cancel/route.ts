import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedAdmin } from '@/lib/admin'

// POST /api/admin/orders/[id]/cancel - Cancel an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin()
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'order_not_found' }, { status: 404 })
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'already_cancelled' }, { status: 400 })
    }

    if (order.status === 'delivered') {
      return NextResponse.json({ success: false, error: 'cannot_cancel_delivered' }, { status: 400 })
    }

    // Restore stock for each item
    for (const item of order.order_items || []) {
      try {
        // Get current stock and add back
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()

        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.product_id)
        }
      } catch (stockError) {
        console.error('Restore stock error:', stockError)
      }
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Cancel order error:', updateError)
      return NextResponse.json({ success: false, error: 'update_failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin cancel order error:', error)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}
