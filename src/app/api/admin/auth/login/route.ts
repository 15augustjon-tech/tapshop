import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Generate session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Get admin credentials from env
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Admin credentials not configured' },
        { status: 500 }
      )
    }

    // Check email first
    if (email !== adminEmail) {
      return NextResponse.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Check for password in database first (from password reset)
    let isPasswordValid = false
    const supabase = createServiceRoleClient()

    try {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('password_hash')
        .eq('id', 'admin')
        .single()

      if (settings?.password_hash) {
        // Use bcrypt to compare database password
        isPasswordValid = await bcrypt.compare(password, settings.password_hash)
      }
    } catch {
      // Table doesn't exist or other error, fall back to env var
    }

    // Fall back to env var password if not using database password
    if (!isPasswordValid && adminPassword) {
      isPasswordValid = password === adminPassword
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Generate session token and store in database
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store session in database (upsert to admin_settings)
    const { error: sessionError } = await supabase
      .from('admin_settings')
      .upsert({
        id: 'admin',
        session_token: sessionToken,
        session_expires: expiresAt.toISOString()
      }, { onConflict: 'id' })

    if (sessionError) {
      console.error('Session save error:', sessionError)
      // Continue anyway - cookie-only fallback
    }

    // Store session token in cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
