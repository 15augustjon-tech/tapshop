import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Get admin settings with the token
    const { data: settings, error: fetchError } = await supabase
      .from('admin_settings')
      .select('reset_token, reset_token_expires')
      .eq('id', 'admin')
      .single()

    if (fetchError || !settings) {
      return NextResponse.json(
        { success: false, message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ' },
        { status: 400 }
      )
    }

    // Verify token
    if (settings.reset_token !== token) {
      return NextResponse.json(
        { success: false, message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ' },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date(settings.reset_token_expires) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'ลิงก์หมดอายุแล้ว กรุณาขอลิงก์ใหม่' },
        { status: 400 }
      )
    }

    // Hash the new password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('admin_settings')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', 'admin')

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
