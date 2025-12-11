// Simple OTP System - Stores in Supabase, sends via free SMS API
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Test phone numbers (always use code 123456)
const TEST_PHONES = [
  '+66858704317',
  '0858704317',
]

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Check if phone is a test number
function isTestPhone(phone: string): boolean {
  // Normalize to just the 9-digit local number (without country code or leading 0)
  const normalize = (p: string): string => {
    const digits = p.replace(/\D/g, '')
    // Remove country code 66 if present
    if (digits.startsWith('66') && digits.length === 11) {
      return digits.slice(2) // 66858704317 -> 858704317
    }
    // Remove leading 0 if present
    if (digits.startsWith('0') && digits.length === 10) {
      return digits.slice(1) // 0858704317 -> 858704317
    }
    return digits
  }

  const normalizedInput = normalize(phone)
  return TEST_PHONES.some(t => normalize(t) === normalizedInput)
}

/**
 * Send OTP - stores in Supabase and sends SMS
 */
export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    // Test phone always uses 123456
    const code = isTestPhone(phone) ? '123456' : generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTP for this phone
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', phone)

    // Store new OTP
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone,
        code,
        type: 'seller',
        expires_at: expiresAt.toISOString(),
        verified: false
      })

    if (insertError) {
      console.error('Failed to store OTP:', insertError)
      return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
    }

    // Skip SMS for test phones
    if (isTestPhone(phone)) {
      console.log(`[TEST] OTP for ${phone}: ${code}`)
      return { success: true, code }
    }

    // Try to send SMS
    const smsResult = await sendSMS(phone, `TapShop: รหัสยืนยันของคุณคือ ${code}`)

    if (!smsResult.success) {
      console.error('SMS failed:', smsResult.error)
    } else {
      console.log(`SMS sent successfully to ${phone}`)
    }

    // ALWAYS return the code for now during testing phase
    // This allows users to still verify even if SMS fails
    // Remove this once SMS provider is confirmed working
    console.log(`[OTP] Code for ${phone}: ${code}`)
    return { success: true, code }
  } catch (error) {
    console.error('Send OTP error:', error)
    return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
  }
}

/**
 * Verify OTP against Supabase
 */
export async function verifyOTP(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (fetchError || !otpRecord) {
      return { success: false, error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ' }
    }

    // Mark as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id)

    // Clean up old OTPs for this phone
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', phone)
      .neq('id', otpRecord.id)

    return { success: true }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return { success: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }
  }
}

/**
 * Send SMS via multiple providers (tries each until one works)
 */
async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  // Format phone for international
  const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`

  // Try TextBelt (free tier)
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
        key: process.env.TEXTBELT_API_KEY || 'textbelt'
      })
    })

    const data = await response.json()

    if (data.success) {
      return { success: true }
    }

    console.log('TextBelt response:', data)
  } catch (error) {
    console.error('TextBelt error:', error)
  }

  // If TextBelt fails, could add more providers here
  // For now, return success anyway so testing can continue
  // (OTP is stored in DB, user can be given code manually for testing)

  console.warn('SMS sending failed, but OTP is stored in database')
  return { success: false, error: 'SMS ส่งไม่สำเร็จ' }
}
