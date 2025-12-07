import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  calculateDistance,
  estimateDeliveryFee,
  getNextDeliverySlot,
  MAX_DELIVERY_DISTANCE,
  COD_FEE
} from '@/lib/delivery'
import { sendNewOrderNotification, isLineConfigured } from '@/lib/line'

interface OrderItem {
  productId: string
  quantity: number
}

interface CreateOrderRequest {
  shopSlug: string
  items: OrderItem[]
  buyerName: string
  buyerPhone: string
  buyerAddress: string
  buyerLat: number
  buyerLng: number
  buyerNotes?: string
  saveAddress?: boolean
}

// Generate order number: TPS-XXXX
function generateOrderNumber(): string {
  const randomPart = Math.floor(1000 + Math.random() * 9000)
  return `TPS-${randomPart}`
}

// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/orders - Create new order (no auth required - frictionless checkout)
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json()
    const {
      shopSlug,
      items,
      buyerName,
      buyerPhone,
      buyerAddress,
      buyerLat,
      buyerLng,
      buyerNotes,
      saveAddress
    } = body

    // Validate required fields
    if (!shopSlug || !items?.length || !buyerName || !buyerPhone || !buyerAddress) {
      return NextResponse.json(
        { success: false, error: 'missing_fields', message: 'กรุณากรอกข้อมูลให้ครบ' },
        { status: 400 }
      )
    }

    // Validate phone format (Thai mobile: 0xxxxxxxxx)
    if (!/^0\d{9}$/.test(buyerPhone)) {
      return NextResponse.json(
        { success: false, error: 'invalid_phone', message: 'เบอร์โทรไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    if (isNaN(buyerLat) || isNaN(buyerLng)) {
      return NextResponse.json(
        { success: false, error: 'invalid_coordinates', message: 'กรุณาเลือกที่อยู่จากแผนที่' },
        { status: 400 }
      )
    }

    // Validate items
    for (const item of items) {
      if (!uuidRegex.test(item.productId) || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: 'invalid_items', message: 'รายการสินค้าไม่ถูกต้อง' },
          { status: 400 }
        )
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get seller info
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, shop_name, pickup_lat, pickup_lng, shipping_days, shipping_time, is_active, line_user_id')
      .eq('shop_slug', shopSlug.toLowerCase())
      .single()

    if (sellerError || !seller) {
      return NextResponse.json(
        { success: false, error: 'shop_not_found', message: 'ไม่พบร้านค้า' },
        { status: 404 }
      )
    }

    if (!seller.is_active) {
      return NextResponse.json(
        { success: false, error: 'shop_inactive', message: 'ร้านค้าปิดให้บริการ' },
        { status: 400 }
      )
    }

    if (!seller.pickup_lat || !seller.pickup_lng) {
      return NextResponse.json(
        { success: false, error: 'no_seller_location', message: 'ร้านค้ายังไม่ได้ตั้งค่าที่อยู่' },
        { status: 400 }
      )
    }

    // Calculate distance
    const distance = calculateDistance(
      seller.pickup_lat,
      seller.pickup_lng,
      buyerLat,
      buyerLng
    )

    if (distance > MAX_DELIVERY_DISTANCE) {
      return NextResponse.json({
        success: false,
        error: 'out_of_range',
        message: `ที่อยู่ไกลเกินไป (รับส่งได้ไม่เกิน ${MAX_DELIVERY_DISTANCE} กม.)`
      }, { status: 400 })
    }

    // Get products and validate stock
    const productIds = items.map(i => i.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, is_active, seller_id')
      .in('id', productIds)

    if (productsError || !products) {
      return NextResponse.json(
        { success: false, error: 'products_error', message: 'เกิดข้อผิดพลาดในการตรวจสอบสินค้า' },
        { status: 500 }
      )
    }

    // Validate all products exist, are active, and belong to seller
    const productMap = new Map(products.map(p => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'product_not_found', message: 'ไม่พบสินค้าบางรายการ' },
          { status: 400 }
        )
      }

      if (!product.is_active) {
        return NextResponse.json(
          { success: false, error: 'product_inactive', message: `สินค้า "${product.name}" ไม่พร้อมขาย` },
          { status: 400 }
        )
      }

      if (product.seller_id !== seller.id) {
        return NextResponse.json(
          { success: false, error: 'wrong_seller', message: 'สินค้าไม่ได้อยู่ในร้านนี้' },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: 'insufficient_stock', message: `สินค้า "${product.name}" เหลือไม่พอ (เหลือ ${product.stock} ชิ้น)` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    let subtotal = 0
    for (const item of items) {
      const product = productMap.get(item.productId)!
      subtotal += product.price * item.quantity
    }

    const deliveryFee = estimateDeliveryFee(distance)
    const total = subtotal + deliveryFee + COD_FEE

    // Get delivery slot
    const deliverySlot = getNextDeliverySlot({
      shipping_days: seller.shipping_days || ['mon', 'tue', 'wed', 'thu', 'fri'],
      shipping_time: seller.shipping_time || '14:00'
    })

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Find or create buyer by phone (frictionless - no login required)
    let buyerId: string
    const { data: existingBuyer } = await supabase
      .from('buyers')
      .select('id')
      .eq('phone', buyerPhone.trim())
      .single()

    if (existingBuyer) {
      buyerId = existingBuyer.id
      // Update buyer name if provided
      if (buyerName.trim()) {
        await supabase
          .from('buyers')
          .update({ name: buyerName.trim() })
          .eq('id', buyerId)
      }
    } else {
      // Create new buyer
      const { data: newBuyer, error: buyerError } = await supabase
        .from('buyers')
        .insert({
          phone: buyerPhone.trim(),
          name: buyerName.trim() || null
        })
        .select('id')
        .single()

      if (buyerError || !newBuyer) {
        console.error('Create buyer error:', buyerError)
        return NextResponse.json(
          { success: false, error: 'buyer_creation_failed', message: 'ไม่สามารถสร้างบัญชีผู้ซื้อได้' },
          { status: 500 }
        )
      }
      buyerId = newBuyer.id
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        seller_id: seller.id,
        buyer_id: buyerId,
        buyer_name: buyerName.trim(),
        buyer_phone: buyerPhone.trim(),
        buyer_address: buyerAddress.trim(),
        buyer_lat: buyerLat,
        buyer_lng: buyerLng,
        buyer_notes: buyerNotes?.trim() || null,
        subtotal,
        delivery_fee: deliveryFee,
        cod_fee: COD_FEE,
        total,
        status: 'pending',
        scheduled_date: deliverySlot.date.toISOString().split('T')[0],
        scheduled_time: deliverySlot.timeString
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Create order error:', orderError)
      return NextResponse.json(
        { success: false, error: 'order_creation_failed', message: 'ไม่สามารถสร้างคำสั่งซื้อได้' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map(item => {
      const product = productMap.get(item.productId)!
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product.name,
        price: product.price,
        quantity: item.quantity
      }
    })

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Create order items error:', itemsError)
      // Delete the order if items failed
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { success: false, error: 'items_creation_failed', message: 'เกิดข้อผิดพลาดในการสร้างรายการสินค้า' },
        { status: 500 }
      )
    }

    // Reduce stock for each product
    for (const item of items) {
      const product = productMap.get(item.productId)!
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: product.stock - item.quantity })
        .eq('id', item.productId)

      if (stockError) {
        console.error('Update stock error:', stockError)
        // Continue anyway - stock will be corrected manually if needed
      }
    }

    // Save buyer address if requested (non-critical, don't block on failure)
    if (saveAddress) {
      try {
        await supabase
          .from('buyer_addresses')
          .insert({
            buyer_id: buyerId,
            label: 'ที่อยู่จัดส่ง',
            name: buyerName.trim(),
            phone: buyerPhone.trim(),
            address: buyerAddress.trim(),
            lat: buyerLat,
            lng: buyerLng,
            notes: buyerNotes?.trim() || null
          })
      } catch (addressError) {
        console.error('Save address error (non-critical):', addressError)
      }
    }

    // Send LINE notification to seller (non-blocking)
    if (seller.line_user_id && isLineConfigured()) {
      try {
        await sendNewOrderNotification(seller.line_user_id, {
          orderNumber: order.order_number,
          items: orderItems.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total,
          buyerName: buyerName.trim(),
          deliveryTime: deliverySlot.fullString
        })
      } catch (lineError) {
        console.error('LINE notification failed (non-critical):', lineError)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        scheduled_date: order.scheduled_date,
        scheduled_time: order.scheduled_time,
        delivery_slot: deliverySlot.fullString
      }
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}
