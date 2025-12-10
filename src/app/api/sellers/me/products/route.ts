import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedSeller } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    const auth = await getAuthenticatedSeller()

    if (!auth.success || !auth.seller) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const sellerId = auth.seller.id

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get products error:', error)
      // Handle table not existing yet (PGRST205 = table not found in schema cache)
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return NextResponse.json({
          success: true,
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
      products: products || []
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
