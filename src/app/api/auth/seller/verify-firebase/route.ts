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

    // Check if seller already exists
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('*')
      .eq('phone', phone)
      .single()

    let seller
    let isNew = false

    if (existingSeller) {
      seller = existingSeller
    } else {
      // Create new seller with phone and Firebase UID
      const { data: newSeller, error: createError } = await supabase
        .from('sellers')
        .insert({
          phone,
          firebase_uid: decodedToken.uid,
          is_active: true,
          onboarding_completed: false
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create seller:', createError)
        return NextResponse.json(
          { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
          { status: 500 }
        )
      }

      seller = newSeller
      isNew = true
    }

    // Update Firebase UID if not set
    if (!existingSeller?.firebase_uid && decodedToken.uid) {
      await supabase
        .from('sellers')
        .update({ firebase_uid: decodedToken.uid })
        .eq('id', seller.id)
    }

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('seller_id', seller.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    cookieStore.set('seller_phone', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    // Determine where to redirect
    let redirectTo = '/seller/dashboard'
    if (!seller.onboarding_completed) {
      redirectTo = '/seller/signup/info'
    }

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        phone: seller.phone,
        shop_name: seller.shop_name,
        shop_slug: seller.shop_slug,
        onboarding_completed: seller.onboarding_completed
      },
      isNew,
      redirectTo
    })

  } catch (error) {
    console.error('Verify Firebase error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
