import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const sellerId = auth.seller.id

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Build query
    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Get orders error:', error)
      // Handle table not existing yet (PGRST205 = table not found in schema cache)
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return NextResponse.json({
          success: true,
          orders: [],
          pagination: { total: 0, page, limit, hasMore: false }
        })
      }
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
        { status: 500 }
      )
    }

    const total = count || 0
    const hasMore = offset + limit < total

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        total,
        page,
        limit,
        hasMore
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// Confirm all pending orders
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const sellerId = auth.seller.id

    const body = await request.json()
    const { action } = body

    if (action !== 'confirm_all') {
      return NextResponse.json(
        { success: false, error: 'invalid_action', message: 'Action ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update all pending orders to confirmed
    const { data: orders, error } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('seller_id', sellerId)
      .eq('status', 'pending')
      .select()

    if (error) {
      console.error('Confirm orders error:', error)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      confirmed_count: orders?.length || 0,
      message: `ยืนยันแล้ว ${orders?.length || 0} รายการ`
    })
  } catch (error) {
    console.error('Confirm orders error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
