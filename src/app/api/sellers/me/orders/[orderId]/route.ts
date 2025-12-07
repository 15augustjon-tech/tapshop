import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

const VALID_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'] as const
type OrderStatus = typeof VALID_STATUSES[number]

// Map status to timestamp field
const STATUS_TIMESTAMP_MAP: Record<OrderStatus, string | null> = {
  pending: null,
  confirmed: 'confirmed_at',
  shipping: 'shipped_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at'
}

// Valid status transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: []
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const { orderId } = await params
    const sellerId = auth.seller.id

    // Validate orderId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { success: false, error: 'invalid_order_id', message: 'รหัสออเดอร์ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status: newStatus } = body

    // Validate new status
    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'invalid_status', message: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current order (verify ownership)
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, seller_id')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'order_not_found', message: 'ไม่พบออเดอร์' },
        { status: 404 }
      )
    }

    // Verify seller owns this order
    if (order.seller_id !== sellerId) {
      return NextResponse.json(
        { success: false, error: 'forbidden', message: 'ไม่มีสิทธิ์แก้ไขออเดอร์นี้' },
        { status: 403 }
      )
    }

    // Validate status transition
    const currentStatus = order.status as OrderStatus
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []

    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_transition',
          message: `ไม่สามารถเปลี่ยนสถานะจาก ${currentStatus} เป็น ${newStatus} ได้`
        },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, string> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    }

    // Add timestamp for the new status
    const timestampField = STATUS_TIMESTAMP_MAP[newStatus as OrderStatus]
    if (timestampField) {
      updateData[timestampField] = new Date().toISOString()
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Update order error:', updateError)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'อัพเดทสถานะแล้ว'
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
