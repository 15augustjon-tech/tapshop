import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    // Validate inputs
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'missing_fields', message: 'กรุณากรอกข้อมูลให้ครบ' },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'invalid_code', message: 'รหัส OTP ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find the OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('type', 'seller')
      .eq('verified', false)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { success: false, error: 'otp_not_found', message: 'ไม่พบรหัส OTP กรุณาส่งใหม่' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Clean up expired OTP
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', otpRecord.id)

      return NextResponse.json(
        { success: false, error: 'otp_expired', message: 'รหัส OTP หมดอายุ กรุณาส่งใหม่' },
        { status: 400 }
      )
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      return NextResponse.json(
        { success: false, error: 'invalid_otp', message: 'รหัส OTP ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    // Check if seller already exists
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('*')
      .eq('phone', phone)
      .single()

    let seller
    let isNew = false

    if (existingSeller) {
      // Existing seller
      seller = existingSeller
    } else {
      // Create new seller with just phone
      const { data: newSeller, error: createError } = await supabase
        .from('sellers')
        .insert({
          phone,
          is_active: true,
          onboarding_completed: false
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create seller:', createError)
        return NextResponse.json(
          { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
          { status: 500 }
        )
      }

      seller = newSeller
      isNew = true
    }

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('seller_id', seller.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    cookieStore.set('seller_phone', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    // Clean up used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', otpRecord.id)

    // Determine where to redirect
    let redirectTo = '/seller/dashboard'
    if (!seller.onboarding_completed) {
      redirectTo = '/seller/signup/info'
    }

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        phone: seller.phone,
        shop_name: seller.shop_name,
        shop_slug: seller.shop_slug,
        onboarding_completed: seller.onboarding_completed
      },
      isNew,
      redirectTo
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
