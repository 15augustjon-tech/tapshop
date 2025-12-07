import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { available: false, error: 'missing_slug' },
        { status: 400 }
      )
    }

    // Validate slug format (lowercase, alphanumeric, hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { available: false, error: 'invalid_format', message: 'ใช้ได้เฉพาะ a-z, 0-9 และ -' },
        { status: 400 }
      )
    }

    // Check length
    if (slug.length < 3 || slug.length > 30) {
      return NextResponse.json(
        { available: false, error: 'invalid_length', message: 'ต้องมี 3-30 ตัวอักษร' },
        { status: 400 }
      )
    }

    // Reserved slugs
    const reserved = ['admin', 'seller', 'buyer', 'api', 'track', 'login', 'signup', 'settings', 'dashboard', 'products', 'orders', 'tapshop']
    if (reserved.includes(slug)) {
      return NextResponse.json(
        { available: false, error: 'reserved', message: 'ชื่อนี้ถูกสงวนไว้' },
        { status: 200 }
      )
    }

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if slug exists
    const { data: existing } = await supabase
      .from('sellers')
      .select('id')
      .eq('shop_slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({
        available: false,
        message: 'ถูกใช้แล้ว'
      })
    }

    return NextResponse.json({
      available: true,
      message: 'ใช้ได้'
    })

  } catch (error) {
    console.error('Check slug error:', error)
    return NextResponse.json(
      { available: false, error: 'server_error' },
      { status: 500 }
    )
  }
}
