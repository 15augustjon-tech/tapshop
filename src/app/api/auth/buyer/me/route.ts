import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedBuyer } from '@/lib/auth'

// GET /api/auth/buyer/me - Get current buyer info
export async function GET() {
  try {
    const auth = await getAuthenticatedBuyer()

    if (!auth.success || !auth.buyer) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get buyer details with addresses
    const { data: buyer, error: buyerError } = await supabase
      .from('buyers')
      .select('id, phone, name, created_at')
      .eq('id', auth.buyer.id)
      .single()

    if (buyerError || !buyer) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      )
    }

    // Get saved addresses
    const { data: addresses } = await supabase
      .from('buyer_addresses')
      .select('*')
      .eq('buyer_id', buyer.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      buyer: {
        ...buyer,
        addresses: addresses || []
      }
    })
  } catch (error) {
    console.error('Get buyer error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
