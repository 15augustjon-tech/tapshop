import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateOTP, sendOTP } from '@/lib/twilio'

// Rate limiting: track OTP requests per phone
const otpRequests = new Map<string, { count: number; resetAt: number }>()

// Convert Thai phone format to international
function toInternationalPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // If starts with 0, replace with +66
  if (digits.startsWith('0')) {
    return '+66' + digits.slice(1)
  }

  // If starts with 66, add +
  if (digits.startsWith('66')) {
    return '+' + digits
  }

  // If already has +66
  if (phone.startsWith('+66')) {
    return phone.replace(/\D/g, '').replace(/^/, '+')
  }

  return '+66' + digits
}

// Validate Thai phone number
function isValidThaiPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')

  // Thai mobile: 08X, 09X (10 digits total)
  if (digits.startsWith('0')) {
    return /^0[689]\d{8}$/.test(digits)
  }

  // International format: 668X, 669X (11 digits)
  if (digits.startsWith('66')) {
    return /^66[689]\d{8}$/.test(digits)
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    // Validate phone
    if (!phone || !isValidThaiPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'invalid_phone', message: 'เบอร์โทรไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const internationalPhone = toInternationalPhone(phone)

    // Rate limiting: max 3 OTP requests per phone per hour
    const now = Date.now()
    const hourMs = 60 * 60 * 1000
    const phoneKey = internationalPhone
    const rateLimit = otpRequests.get(phoneKey)

    if (rateLimit) {
      if (now < rateLimit.resetAt) {
        if (rateLimit.count >= 3) {
          return NextResponse.json(
            { success: false, error: 'rate_limited', message: 'ส่ง OTP มากเกินไป กรุณารอ 1 ชั่วโมง' },
            { status: 429 }
          )
        }
        rateLimit.count++
      } else {
        // Reset after 1 hour
        otpRequests.set(phoneKey, { count: 1, resetAt: now + hourMs })
      }
    } else {
      otpRequests.set(phoneKey, { count: 1, resetAt: now + hourMs })
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Clean up old OTPs for this phone
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', internationalPhone)
      .eq('type', 'seller')

    // Generate new OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: internationalPhone,
        code,
        type: 'seller',
        expires_at: expiresAt.toISOString(),
        verified: false
      })

    if (insertError) {
      console.error('Failed to store OTP:', insertError)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    // Send OTP via SMS
    const smsSent = await sendOTP(internationalPhone, code)

    if (!smsSent) {
      return NextResponse.json(
        { success: false, error: 'sms_failed', message: 'ส่ง SMS ไม่สำเร็จ กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    // Return success (mask phone number in response)
    const maskedPhone = phone.replace(/(\d{3})\d{4}(\d{3})/, '$1-XXX-$2')

    return NextResponse.json({
      success: true,
      message: `รหัส OTP ถูกส่งไปที่ ${maskedPhone}`,
      phone: internationalPhone // For verify step
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
