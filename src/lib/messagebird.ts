import messagebird from 'messagebird'

// Initialize MessageBird client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = (messagebird as any).initClient(process.env.MESSAGEBIRD_API_KEY || '')

interface VerifyCreateResponse {
  id: string
  href: string
  recipient: string
  reference: string | null
  messages: {
    href: string
  }
  status: string
  createdDatetime: string
  validUntilDatetime: string
}

interface VerifyResponse {
  id: string
  href: string
  recipient: string
  reference: string | null
  status: string
  createdDatetime: string
  validUntilDatetime: string
}

/**
 * Send OTP via MessageBird Verify API
 * Returns verification ID to use for verification
 */
export async function sendOTP(phone: string): Promise<{ success: boolean; verifyId?: string; error?: string }> {
  return new Promise((resolve) => {
    // MessageBird expects E.164 format
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`

    client.verify.create(formattedPhone, {
      originator: 'TapShop',
      template: 'รหัส OTP ของคุณคือ %token',
      timeout: 300, // 5 minutes
      tokenLength: 6,
      type: 'sms'
    }, (err: Error | null, response: VerifyCreateResponse) => {
      if (err) {
        console.error('MessageBird send error:', err)
        resolve({ success: false, error: 'ส่ง OTP ไม่สำเร็จ' })
        return
      }

      resolve({ success: true, verifyId: response.id })
    })
  })
}

/**
 * Verify OTP via MessageBird Verify API
 */
export async function verifyOTP(verifyId: string, token: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    client.verify.verify(verifyId, token, (err: Error | null, response: VerifyResponse) => {
      if (err) {
        const mbError = err as Error & { statusCode?: number }
        console.error('MessageBird verify error:', err)

        // Handle specific error codes
        if (mbError.statusCode === 422) {
          resolve({ success: false, error: 'รหัส OTP ไม่ถูกต้อง' })
          return
        }
        if (mbError.statusCode === 404) {
          resolve({ success: false, error: 'รหัส OTP หมดอายุ กรุณาขอใหม่' })
          return
        }

        resolve({ success: false, error: 'ตรวจสอบ OTP ไม่สำเร็จ' })
        return
      }

      if (response.status === 'verified') {
        resolve({ success: true })
      } else {
        resolve({ success: false, error: 'รหัส OTP ไม่ถูกต้อง' })
      }
    })
  })
}
