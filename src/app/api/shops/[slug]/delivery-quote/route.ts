import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  calculateDistance,
  estimateDeliveryFee,
  getNextDeliverySlot,
  MAX_DELIVERY_DISTANCE,
  COD_FEE
} from '@/lib/delivery'
import { getQuote, isLalamoveConfigured } from '@/lib/lalamove'

// GET /api/shops/[slug]/delivery-quote - Get delivery quote for address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'invalid_coordinates', message: 'กรุณาระบุที่อยู่' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get seller with location and schedule
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, shop_name, pickup_address, pickup_lat, pickup_lng, shipping_days, shipping_time, is_active')
      .eq('shop_slug', slug.toLowerCase())
      .single()

    if (sellerError || !seller) {
      console.error('Get seller error:', sellerError)
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบร้านค้า' },
        { status: 404 }
      )
    }

    if (!seller.is_active) {
      return NextResponse.json(
        { success: false, error: 'shop_inactive', message: 'ร้านค้าปิดให้บริการ' },
        { status: 404 }
      )
    }

    // Check if seller has location set
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
      lat,
      lng
    )

    // Check if within delivery range
    if (distance > MAX_DELIVERY_DISTANCE) {
      return NextResponse.json({
        success: false,
        error: 'out_of_range',
        message: `ที่อยู่ไกลเกินไป (รับส่งได้ไม่เกิน ${MAX_DELIVERY_DISTANCE} กม.)`,
        distance: Math.round(distance * 10) / 10,
        maxDistance: MAX_DELIVERY_DISTANCE
      }, { status: 400 })
    }

    // Get address from query params for Lalamove
    const dropoffAddress = searchParams.get('address') || 'ที่อยู่ลูกค้า'

    // Try to get Lalamove quote, fallback to our estimate
    let deliveryFee: number
    let quotationId: string | null = null

    if (isLalamoveConfigured()) {
      try {
        const lalamoveQuote = await getQuote(
          seller.pickup_lat,
          seller.pickup_lng,
          seller.pickup_address || seller.shop_name,
          lat,
          lng,
          dropoffAddress
        )
        deliveryFee = lalamoveQuote.fee
        quotationId = lalamoveQuote.quotationId
      } catch (error) {
        console.error('Lalamove quote failed, using estimate:', error)
        deliveryFee = estimateDeliveryFee(distance)
      }
    } else {
      // Lalamove not configured, use our estimate
      deliveryFee = estimateDeliveryFee(distance)
    }

    // Get next delivery slot
    const deliverySlot = getNextDeliverySlot({
      shipping_days: seller.shipping_days || ['mon', 'tue', 'wed', 'thu', 'fri'],
      shipping_time: seller.shipping_time || '14:00'
    })

    return NextResponse.json({
      success: true,
      quote: {
        distance: Math.round(distance * 10) / 10, // km, 1 decimal
        deliveryFee,
        codFee: COD_FEE,
        deliveryDate: deliverySlot.dateString,
        deliveryTime: deliverySlot.timeString,
        deliverySlotFull: deliverySlot.fullString,
        deliveryTimestamp: deliverySlot.date.toISOString(),
        ...(quotationId && { quotationId }) // Include Lalamove quotation ID if available
      }
    })
  } catch (error) {
    console.error('Delivery quote error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
