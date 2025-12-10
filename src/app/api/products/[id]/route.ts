import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const { id: productId } = await params

    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: 'รหัสสินค้าไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบสินค้า' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (product.seller_id !== auth.seller.id) {
      return NextResponse.json(
        { success: false, error: 'forbidden', message: 'ไม่มีสิทธิ์เข้าถึงสินค้านี้' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const { id: productId } = await params

    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: 'รหัสสินค้าไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, price, stock, image_url, is_active } = body

    // Validate fields
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

    if (price === undefined || isNaN(Number(price)) || Number(price) < 1) {
      return NextResponse.json(
        { success: false, error: 'invalid_price', message: 'ราคาต้องมากกว่า 0' },
        { status: 400 }
      )
    }

    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return NextResponse.json(
        { success: false, error: 'invalid_stock', message: 'จำนวนสินค้าต้องไม่ติดลบ' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First verify ownership
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', productId)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบสินค้า' },
        { status: 404 }
      )
    }

    if (existingProduct.seller_id !== auth.seller.id) {
      return NextResponse.json(
        { success: false, error: 'forbidden', message: 'ไม่มีสิทธิ์แก้ไขสินค้านี้' },
        { status: 403 }
      )
    }

    // Update product
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        image_url: image_url || null,
        is_active: is_active !== false
      })
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Update product error:', updateError)
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
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const { id: productId } = await params

    if (!uuidRegex.test(productId)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: 'รหัสสินค้าไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First verify ownership
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบสินค้า' },
        { status: 404 }
      )
    }

    if (product.seller_id !== auth.seller.id) {
      return NextResponse.json(
        { success: false, error: 'forbidden', message: 'ไม่มีสิทธิ์ลบสินค้านี้' },
        { status: 403 }
      )
    }

    // Check for pending orders containing this product
    const { data: pendingOrderItems, error: orderCheckError } = await supabase
      .from('order_items')
      .select(`
        id,
        order:orders!inner(id, status)
      `)
      .eq('product_id', productId)

    if (!orderCheckError && pendingOrderItems) {
      const hasPendingOrders = pendingOrderItems.some((item: { order?: { status?: string }[] | { status?: string } }) => {
        // Handle both array and object forms of the relation
        const orderData = Array.isArray(item.order) ? item.order[0] : item.order
        const status = orderData?.status
        return status === 'pending' || status === 'confirmed' || status === 'shipping'
      })

      if (hasPendingOrders) {
        return NextResponse.json(
          {
            success: false,
            error: 'has_pending_orders',
            message: 'ไม่สามารถลบได้ มีออเดอร์ที่ยังไม่เสร็จ'
          },
          { status: 400 }
        )
      }
    }

    // Delete product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Delete product error:', deleteError)
      return NextResponse.json(
        { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ลบสินค้าแล้ว'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
