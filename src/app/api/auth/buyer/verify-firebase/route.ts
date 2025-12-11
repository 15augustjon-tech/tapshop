import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    // Just need phone - Firebase already verified on client side
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'เบอร์โทรไม่ครบ' },
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
