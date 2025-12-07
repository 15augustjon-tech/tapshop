import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// POST /api/auth/buyer/verify-otp
export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    // Validate input
    if (!phone || !/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'invalid_phone', message: 'เบอร์โทรไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'invalid_otp', message: 'รหัส OTP ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', otp)
      .eq('type', 'buyer')
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { success: false, error: 'invalid_otp', message: 'รหัส OTP ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Delete expired OTP
      await supabase.from('otp_codes').delete().eq('id', otpRecord.id)
      return NextResponse.json(
        { success: false, error: 'otp_expired', message: 'รหัส OTP หมดอายุ' },
        { status: 400 }
      )
    }

    // Delete used OTP
    await supabase.from('otp_codes').delete().eq('id', otpRecord.id)

    // Find or create buyer
    let buyer = null
    let isNew = false

    const { data: existingBuyer } = await supabase
      .from('buyers')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingBuyer) {
      buyer = existingBuyer
    } else {
      // Create new buyer
      const { data: newBuyer, error: createError } = await supabase
        .from('buyers')
        .insert({ phone })
        .select()
        .single()

      if (createError) {
        console.error('Create buyer error:', createError)
        return NextResponse.json(
          { success: false, error: 'create_error', message: 'ไม่สามารถสร้างบัญชีได้' },
          { status: 500 }
        )
      }

      buyer = newBuyer
      isNew = true
    }

    // Set session cookies (30 days)
    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    }

    cookieStore.set('buyer_id', buyer.id, cookieOptions)
    cookieStore.set('buyer_phone', buyer.phone, cookieOptions)

    return NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        phone: buyer.phone,
        name: buyer.name
      },
      isNew
    })
  } catch (error) {
    console.error('Verify buyer OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
