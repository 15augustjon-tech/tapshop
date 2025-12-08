import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase-server'
import crypto from 'crypto'

// Simple hash function for password comparison
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

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

    // Check for password override in database (from password reset)
    let isPasswordValid = false
    const supabase = createServiceRoleClient()

    try {
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('password_hash')
        .eq('id', 'admin')
        .single()

      if (settings?.password_hash) {
        // Use database password
        const hashedInput = hashPassword(password)
        isPasswordValid = hashedInput === settings.password_hash
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

    // Generate session token
    const sessionToken = generateSessionToken()
    const hashedToken = hashPassword(sessionToken)

    // Store hashed token in cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    cookieStore.set('admin_session_valid', 'true', {
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
