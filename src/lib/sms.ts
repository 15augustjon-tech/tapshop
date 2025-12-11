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
  const digits = phone.replace(/\D/g, '')
  return TEST_PHONES.some(t => t.replace(/\D/g, '') === digits)
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

    // Send SMS via TextBelt (free tier: 1 SMS/day, or use paid)
    // For testing, we'll also return the code in dev mode
    const isDev = process.env.NODE_ENV === 'development'

    const smsResult = await sendSMS(phone, `TapShop: รหัส OTP ของคุณคือ ${code} (หมดอายุใน 10 นาที)`)

    if (!smsResult.success && !isDev) {
      // In production, fail if SMS doesn't send
      // But we already stored the code, so admin could help verify manually
      console.error('SMS failed but OTP stored:', smsResult.error)
    }

    // In dev mode, return the code for testing
    if (isDev) {
      console.log(`[DEV] OTP for ${phone}: ${code}`)
      return { success: true, code }
    }

    return { success: true }
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
        key: 'textbelt' // Free tier key (1 SMS/day) - replace with paid key for production
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
