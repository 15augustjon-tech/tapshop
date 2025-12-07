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
    const { shop_name, shop_slug, promptpay_id, pickup_address, pickup_lat, pickup_lng } = body

    // Validate required fields
    if (!shop_name || !shop_slug || !promptpay_id || !pickup_address || !pickup_lat || !pickup_lng) {
      return NextResponse.json(
        { success: false, error: 'missing_fields', message: 'กรุณากรอกข้อมูลให้ครบ' },
        { status: 400 }
      )
    }

    // Validate shop name
    if (shop_name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'name_too_long', message: 'ชื่อร้านต้องไม่เกิน 50 ตัวอักษร' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(shop_slug) || shop_slug.length < 3 || shop_slug.length > 30) {
      return NextResponse.json(
        { success: false, error: 'invalid_slug', message: 'ลิงก์ร้านไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Validate promptpay (phone or citizen ID)
    const promptpayDigits = promptpay_id.replace(/\D/g, '')
    if (promptpayDigits.length !== 10 && promptpayDigits.length !== 13) {
      return NextResponse.json(
        { success: false, error: 'invalid_promptpay', message: 'PromptPay ID ต้องเป็นเบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)' },
        { status: 400 }
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if slug is taken by another seller
    const { data: existingSlug } = await supabase
      .from('sellers')
      .select('id')
      .eq('shop_slug', shop_slug)
      .neq('id', sellerId)
      .single()

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'slug_taken', message: 'ลิงก์นี้ถูกใช้แล้ว' },
        { status: 400 }
      )
    }

    // Update seller
    const { data: seller, error: updateError } = await supabase
      .from('sellers')
      .update({
        shop_name,
        shop_slug,
        promptpay_id: promptpayDigits,
        pickup_address,
        pickup_lat,
        pickup_lng
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
        promptpay_id: seller.promptpay_id,
        pickup_address: seller.pickup_address
      }
    })

  } catch (error) {
    console.error('Update info error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
