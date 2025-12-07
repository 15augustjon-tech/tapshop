import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/shops/[slug] - Get shop and products by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'invalid_slug', message: 'ไม่พบร้านค้า' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch seller by shop_slug
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, shop_name, shop_slug, is_active')
      .eq('shop_slug', slug.toLowerCase())
      .single()

    if (sellerError || !seller) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบร้านค้า' },
        { status: 404 }
      )
    }

    // Check if seller is active
    if (!seller.is_active) {
      return NextResponse.json(
        { success: false, error: 'shop_inactive', message: 'ร้านค้านี้ปิดให้บริการชั่วคราว' },
        { status: 404 }
      )
    }

    // Fetch active products for this seller
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, image_url, is_active')
      .eq('seller_id', seller.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Fetch products error:', productsError)
      // Return seller with empty products if products table doesn't exist yet
      if (productsError.code === 'PGRST116' || productsError.code === 'PGRST205') {
        return NextResponse.json({
          success: true,
          seller: {
            shop_name: seller.shop_name,
            shop_slug: seller.shop_slug
          },
          products: []
        })
      }
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      seller: {
        shop_name: seller.shop_name,
        shop_slug: seller.shop_slug
      },
      products: products || []
    })
  } catch (error) {
    console.error('Get shop error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
