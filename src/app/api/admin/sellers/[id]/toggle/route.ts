import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedAdmin } from '@/lib/admin'

// POST /api/admin/sellers/[id]/toggle - Toggle seller active status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin()
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current seller status
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, is_active')
      .eq('id', id)
      .single()

    if (sellerError || !seller) {
      return NextResponse.json({ success: false, error: 'seller_not_found' }, { status: 404 })
    }

    // Toggle status
    const { error: updateError } = await supabase
      .from('sellers')
      .update({
        is_active: !seller.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Toggle seller error:', updateError)
      return NextResponse.json({ success: false, error: 'update_failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      is_active: !seller.is_active
    })
  } catch (error) {
    console.error('Admin toggle seller error:', error)
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 })
  }
}
