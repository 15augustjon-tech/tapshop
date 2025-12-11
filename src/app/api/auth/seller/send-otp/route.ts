import { NextRequest, NextResponse } from 'next/server'
import { sendOTP } from '@/lib/sms'

// Rate limiting: track OTP requests per phone (in-memory for serverless)
const otpRequests = new Map<string, { count: number; resetAt: number }>()

// Convert Thai phone format to international
function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('0')) {
    return '+66' + digits.slice(1)
  }

  if (digits.startsWith('66')) {
    return '+' + digits
  }

  if (phone.startsWith('+66')) {
    return phone.replace(/\D/g, '').replace(/^/, '+')
  }

  return '+66' + digits
}

// Validate Thai phone number
function isValidThaiPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('0')) {
    return /^0[689]\d{8}$/.test(digits)
  }

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

    // Rate limiting: max 5 OTP requests per phone per hour
    const now = Date.now()
    const hourMs = 60 * 60 * 1000
    const phoneKey = internationalPhone
    const rateLimit = otpRequests.get(phoneKey)

    if (rateLimit) {
      if (now < rateLimit.resetAt) {
        if (rateLimit.count >= 5) {
          return NextResponse.json(
            { success: false, error: 'rate_limited', message: 'ส่ง OTP มากเกินไป กรุณารอ 1 ชั่วโมง' },
            { status: 429 }
          )
        }
        rateLimit.count++
      } else {
        otpRequests.set(phoneKey, { count: 1, resetAt: now + hourMs })
      }
    } else {
      otpRequests.set(phoneKey, { count: 1, resetAt: now + hourMs })
    }

    // Send OTP via our simple system
    const result = await sendOTP(internationalPhone)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'sms_failed', message: result.error || 'ส่ง SMS ไม่สำเร็จ กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    // Return success (mask phone number in response)
    const maskedPhone = phone.replace(/(\d{3})\d{4}(\d{3})/, '$1-XXX-$2')

    // In dev mode, include the OTP code for testing
    const response: { success: boolean; message: string; phone: string; code?: string } = {
      success: true,
      message: `รหัส OTP ถูกส่งไปที่ ${maskedPhone}`,
      phone: internationalPhone
    }

    // Include code in dev mode for easy testing
    if (result.code) {
      response.code = result.code
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
