// Twilio Verify API
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || ''
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || ''
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || ''

/**
 * Send OTP via Twilio Verify API
 */
export async function sendOTP(phone: string): Promise<{ success: boolean; verifyId?: string; error?: string }> {
  try {
    // Twilio expects E.164 format
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedPhone,
          Channel: 'sms'
        }).toString()
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio send error:', JSON.stringify(data, null, 2))
      return { success: false, error: data.message || 'ส่ง OTP ไม่สำเร็จ' }
    }

    // Twilio Verify uses the phone number as the identifier, not a separate ID
    return { success: true, verifyId: formattedPhone }
  } catch (error) {
    console.error('Twilio send exception:', error)
    return { success: false, error: 'ส่ง OTP ไม่สำเร็จ' }
  }
}

/**
 * Verify OTP via Twilio Verify API
 */
export async function verifyOTP(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          Code: code
        }).toString()
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Twilio verify error:', JSON.stringify(data, null, 2))

      if (data.code === 20404) {
        return { success: false, error: 'รหัส OTP หมดอายุ กรุณาขอใหม่' }
      }

      return { success: false, error: 'รหัส OTP ไม่ถูกต้อง' }
    }

    if (data.status === 'approved') {
      return { success: true }
    } else {
      return { success: false, error: 'รหัส OTP ไม่ถูกต้อง' }
    }
  } catch (error) {
    console.error('Twilio verify exception:', error)
    return { success: false, error: 'ตรวจสอบ OTP ไม่สำเร็จ' }
  }
}
