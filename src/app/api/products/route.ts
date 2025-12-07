import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const sellerId = auth.seller.id
    const body = await request.json()
    const { name, price, stock, image_url, is_active } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'missing_name', message: 'กรุณากรอกชื่อสินค้า' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'name_too_long', message: 'ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร' },
        { status: 400 }
      )
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return NextResponse.json(
        { success: false, error: 'invalid_price', message: 'กรุณากรอกราคา' },
        { status: 400 }
      )
    }

    if (Number(price) < 1) {
      return NextResponse.json(
        { success: false, error: 'price_too_low', message: 'ราคาต้องมากกว่า 0' },
        { status: 400 }
      )
    }

    if (stock === undefined || stock === null || isNaN(Number(stock))) {
      return NextResponse.json(
        { success: false, error: 'invalid_stock', message: 'กรุณากรอกจำนวนสินค้า' },
        { status: 400 }
      )
    }

    if (Number(stock) < 0) {
      return NextResponse.json(
        { success: false, error: 'stock_negative', message: 'จำนวนสินค้าต้องไม่ติดลบ' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        seller_id: sellerId,
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        image_url: image_url || null,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) {
      console.error('Create product error:', error)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
