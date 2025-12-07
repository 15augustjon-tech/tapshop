// Twilio SMS Integration for TapShop
// Server-side only - never import this on client

import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER!

// Generate 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via SMS
export async function sendOTP(phone: string, code: string): Promise<boolean> {
  const message = `รหัส OTP ของคุณคือ ${code} (หมดอายุใน 5 นาที)`

  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: phone
    })
    return true
  } catch (error) {
    console.error('Twilio SMS error:', error)
    return false
  }
}

// Send order confirmation SMS to buyer
export async function sendOrderConfirmation(
  phone: string,
  orderNumber: string,
  total: number
): Promise<boolean> {
  const message = `TapShop: คำสั่งซื้อ ${orderNumber} ได้รับแล้ว ยอดรวม ฿${total.toLocaleString()} ติดตามสถานะที่ tapshop.me/track/${orderNumber}`

  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: phone
    })
    return true
  } catch (error) {
    console.error('Twilio SMS error:', error)
    return false
  }
}

// Send delivery status update SMS
export async function sendDeliveryUpdate(
  phone: string,
  orderNumber: string,
  status: 'dispatched' | 'picked_up' | 'delivered'
): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    dispatched: 'กำลังจัดส่ง ไรเดอร์กำลังมารับพัสดุ',
    picked_up: 'ไรเดอร์รับพัสดุแล้ว กำลังเดินทางไปหาคุณ',
    delivered: 'จัดส่งสำเร็จ! ขอบคุณที่ใช้บริการ TapShop'
  }

  const message = `TapShop ${orderNumber}: ${statusMessages[status]}`

  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: phone
    })
    return true
  } catch (error) {
    console.error('Twilio SMS error:', error)
    return false
  }
}
