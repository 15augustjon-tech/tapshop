import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyFirebaseToken } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    // Validate input
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'missing_token', message: 'ข้อมูลไม่ครบ' },
        { status: 400 }
      )
    }

    // Verify the Firebase ID token server-side
    const decodedToken = await verifyFirebaseToken(idToken)

    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'invalid_token', message: 'Token ไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Extract verified phone number from token
    const phone = decodedToken.phone_number

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'no_phone', message: 'ไม่พบเบอร์โทรศัพท์' },
        { status: 400 }
      )
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check request type (signup creates new, login only allows existing)
    const body_parsed = await request.clone().json()
    const isSignupFlow = body_parsed.isSignup === true

    // Check if seller already exists
    const { data: existingSeller } = await supabase
      .from('sellers')
      .select('*')
      .eq('phone', phone)
      .single()

    let seller
    let isNew = false

    if (existingSeller) {
      // Existing seller - use existing account
      seller = existingSeller
    } else if (isSignupFlow) {
      // Only create new seller if this is a signup flow
      const { data: newSeller, error: createError } = await supabase
        .from('sellers')
        .insert({
          phone,
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
    } else {
      // Login flow but seller doesn't exist - return isNew without creating
      return NextResponse.json({
        success: true,
        isNew: true,
        seller: null
      })
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
    console.error('Firebase verify error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
