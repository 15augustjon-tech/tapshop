import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/buyers/lookup - Look up buyer by phone and return saved addresses
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Validate phone format (Thai mobile: 0xxxxxxxxx)
    if (!phone || !/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'invalid_phone', message: 'เบอร์โทรไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find buyer by phone
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .select('id, phone, name')
      .eq('phone', phone)
      .single()

    if (buyerError || !buyer) {
      // New buyer - no saved data
      return NextResponse.json({
        success: true,
        isNew: true,
        buyer: null,
        addresses: []
      })
    }

    // Get saved addresses for this buyer
    const { data: addresses } = await supabase
      .from('buyer_addresses')
      .select('id, label, name, phone, address, lat, lng, notes')
      .eq('buyer_id', buyer.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Also get the most recent order address as a fallback
    const { data: recentOrder } = await supabase
      .from('orders')
      .select('buyer_name, buyer_phone, buyer_address, buyer_lat, buyer_lng, buyer_notes')
      .eq('buyer_id', buyer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Build address list
    const savedAddresses = addresses || []

    // If no saved addresses but has recent order, use that
    if (savedAddresses.length === 0 && recentOrder) {
      savedAddresses.push({
        id: 'recent_order',
        label: 'ที่อยู่ล่าสุด',
        name: recentOrder.buyer_name,
        phone: recentOrder.buyer_phone,
        address: recentOrder.buyer_address,
        lat: recentOrder.buyer_lat,
        lng: recentOrder.buyer_lng,
        notes: recentOrder.buyer_notes
      })
    }

    return NextResponse.json({
      success: true,
      isNew: false,
      buyer: {
        id: buyer.id,
        phone: buyer.phone,
        name: buyer.name
      },
      addresses: savedAddresses
    })
  } catch (error) {
    console.error('Buyer lookup error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
