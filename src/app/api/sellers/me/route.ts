import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    // Get full seller data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: seller, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', auth.seller.id)
      .single()

    if (error || !seller) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบข้อมูลผู้ขาย' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        phone: seller.phone,
        shop_name: seller.shop_name,
        shop_slug: seller.shop_slug,
        promptpay_id: seller.promptpay_id,
        pickup_address: seller.pickup_address,
        pickup_lat: seller.pickup_lat,
        pickup_lng: seller.pickup_lng,
        shipping_days: seller.shipping_days,
        shipping_time: seller.shipping_time,
        is_active: seller.is_active,
        onboarding_completed: seller.onboarding_completed,
        created_at: seller.created_at
      }
    })
  } catch (error) {
    console.error('Get seller error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
