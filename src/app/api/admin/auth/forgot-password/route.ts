import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Get admin email from env
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Admin not configured' },
        { status: 500 }
      )
    }

    // Only send email if it matches admin email
    if (email !== adminEmail) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json({ success: true })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in database
    const supabase = createServiceRoleClient()

    // Check if admin_settings table exists, if not create the record
    const { error: upsertError } = await supabase
      .from('admin_settings')
      .upsert({
        id: 'admin',
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires.toISOString()
      }, { onConflict: 'id' })

    if (upsertError) {
      // Table might not exist, try to create it
      console.error('Admin settings upsert error:', upsertError)

      // For now, just store in a simple way
      // The admin can create the table manually in Supabase
      return NextResponse.json(
        { success: false, message: 'Database not configured for password reset' },
        { status: 500 }
      )
    }

    // Send email using Resend
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/admin/reset-password?token=${resetToken}`

    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    await resend.emails.send({
      from: 'TapShop <noreply@tapshop.me>',
      to: adminEmail,
      subject: 'รีเซ็ตรหัสผ่าน TapShop Admin',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>รีเซ็ตรหัสผ่าน TapShop Admin</h2>
          <p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับ TapShop Admin</p>
          <p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            ตั้งรหัสผ่านใหม่
          </a>
          <p style="color: #666; font-size: 14px;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
          <p style="color: #666; font-size: 14px;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
