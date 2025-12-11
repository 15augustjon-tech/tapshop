import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Verify Firebase ID token using Google's public endpoint
async function verifyFirebaseToken(idToken: string): Promise<{ phone_number?: string } | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    )

    if (!res.ok) {
      console.error('Token verification failed:', await res.text())
      return null
    }

    const data = await res.json()
    const user = data.users?.[0]

    if (!user) return null

    return {
      phone_number: user.phoneNumber
    }
  } catch (err) {
    console.error('Token verification error:', err)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, phone } = body

    if (!idToken || !phone) {
      return NextResponse.json(
        { success: false, message: 'ข้อมูลไม่ครบ' },
        { status: 400 }
      )
    }

    // Verify the Firebase token
    const tokenData = await verifyFirebaseToken(idToken)

    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'การยืนยันล้มเหลว กรุณาลองใหม่' },
        { status: 401 }
      )
    }

    // Make sure the phone matches what Firebase verified
    if (tokenData.phone_number !== phone) {
      return NextResponse.json(
        { success: false, message: 'เบอร์โทรไม่ตรงกัน' },
        { status: 400 }
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if buyer exists
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
      // Create new buyer
      const { data: newBuyer, error: createError } = await supabase
        .from('buyers')
        .insert({ phone })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create buyer:', createError)
        return NextResponse.json(
          { success: false, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
          { status: 500 }
        )
      }

      buyer = newBuyer
      isNew = true
    }

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('buyer_id', buyer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    cookieStore.set('buyer_phone', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

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
    console.error('Verify error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
