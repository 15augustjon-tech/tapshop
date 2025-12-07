import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

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

    const sellerId = auth.seller.id

    const body = await request.json()
    const { shipping_days, shipping_time } = body

    // Validate shipping days
    if (!Array.isArray(shipping_days) || shipping_days.length === 0) {
      return NextResponse.json(
        { success: false, error: 'invalid_days', message: 'กรุณาเลือกวันที่เปิดให้สั่ง' },
        { status: 400 }
      )
    }

    // Validate day values (1-7)
    const validDays = shipping_days.every((day: number) =>
      Number.isInteger(day) && day >= 1 && day <= 7
    )
    if (!validDays) {
      return NextResponse.json(
        { success: false, error: 'invalid_days', message: 'วันที่เลือกไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Validate shipping time
    const validTimes = ['10:00', '14:00', '18:00']
    if (!validTimes.includes(shipping_time)) {
      return NextResponse.json(
        { success: false, error: 'invalid_time', message: 'เวลาจัดส่งไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update seller and mark onboarding complete
    const { data: seller, error: updateError } = await supabase
      .from('sellers')
      .update({
        shipping_days,
        shipping_time,
        onboarding_completed: true
      })
      .eq('id', sellerId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update seller:', updateError)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        shop_name: seller.shop_name,
        shop_slug: seller.shop_slug,
        shipping_days: seller.shipping_days,
        shipping_time: seller.shipping_time,
        onboarding_completed: seller.onboarding_completed
      }
    })

  } catch (error) {
    console.error('Update schedule error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
