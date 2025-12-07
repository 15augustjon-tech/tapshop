import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/auth/buyer/send-otp
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone
    if (!phone || !/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'invalid_phone', message: 'เบอร์โทรไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Delete any existing OTPs for this phone
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', phone)
      .eq('type', 'buyer')

    // Store OTP
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone,
        code: otp,
        type: 'buyer',
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('Insert OTP error:', insertError)
      return NextResponse.json(
        { success: false, error: 'otp_error', message: 'ไม่สามารถส่ง OTP ได้' },
        { status: 500 }
      )
    }

    // TODO: Send OTP via SMS (Twilio, etc.)
    // For MVP: Log to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`[BUYER OTP] Phone: ${phone}, Code: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: 'ส่งรหัส OTP แล้ว',
      // Remove in production:
      debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    console.error('Send buyer OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
