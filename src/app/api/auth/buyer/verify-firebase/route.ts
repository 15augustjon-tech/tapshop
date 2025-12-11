import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getAdminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, phone } = body

    // Validate inputs
    if (!idToken || !phone) {
      return NextResponse.json(
        { success: false, error: 'missing_fields', message: 'ข้อมูลไม่ครบ' },
        { status: 400 }
      )
    }

    // Verify Firebase ID token
    let decodedToken
    try {
      const adminAuth = getAdminAuth()
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch (err) {
      console.error('Firebase token verification error:', err)
      return NextResponse.json(
        { success: false, error: 'invalid_token', message: 'การยืนยันตัวตนล้มเหลว กรุณาลองใหม่' },
        { status: 401 }
      )
    }

    // Verify phone number matches
    if (decodedToken.phone_number !== phone) {
      return NextResponse.json(
        { success: false, error: 'phone_mismatch', message: 'เบอร์โทรไม่ตรงกัน' },
        { status: 400 }
      )
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if buyer already exists
    const { data: existingBuyer } = await supabase
      .from('buyers')
      .select('*')
      .eq('phone', phone)
      .single()

    let buyer
    let isNew = false

    if (existingBuyer) {
      buyer = existingBuyer
    } else {
      // Create new buyer with phone and Firebase UID
      const { data: newBuyer, error: createError } = await supabase
        .from('buyers')
        .insert({
          phone,
          firebase_uid: decodedToken.uid
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create buyer:', createError)
        return NextResponse.json(
          { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
          { status: 500 }
        )
      }

      buyer = newBuyer
      isNew = true
    }

    // Update Firebase UID if not set
    if (!existingBuyer?.firebase_uid && decodedToken.uid) {
      await supabase
        .from('buyers')
        .update({ firebase_uid: decodedToken.uid })
        .eq('id', buyer.id)
    }

    // Create session cookies
    const cookieStore = await cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    }

    cookieStore.set('buyer_id', buyer.id, cookieOptions)
    cookieStore.set('buyer_phone', phone, cookieOptions)

    return NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        phone: buyer.phone,
        name: buyer.name
      },
      isNew
    })

  } catch (error) {
    console.error('Verify Firebase error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
