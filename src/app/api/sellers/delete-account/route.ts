import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const sellerId = cookieStore.get('seller_id')?.value
    const sellerPhone = cookieStore.get('seller_phone')?.value

    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Delete OTP codes for this phone (not linked by FK)
    if (sellerPhone) {
      await supabase
        .from('otp_codes')
        .delete()
        .eq('phone', sellerPhone)
    }

    // 2. Delete seller - CASCADE handles products, orders, order_items, deliveries
    const { data: deletedSeller, error } = await supabase
      .from('sellers')
      .delete()
      .eq('id', sellerId)
      .select()

    if (error) {
      console.error('Delete seller error:', error)
      return NextResponse.json(
        { success: false, message: `ลบบัญชีไม่สำเร็จ: ${error.message}` },
        { status: 500 }
      )
    }

    if (!deletedSeller || deletedSeller.length === 0) {
      console.error('No seller found to delete:', sellerId)
      return NextResponse.json(
        { success: false, message: 'ไม่พบบัญชีที่จะลบ' },
        { status: 404 }
      )
    }

    // 3. Clear session cookies
    cookieStore.delete('seller_id')
    cookieStore.delete('seller_phone')

    return NextResponse.json({
      success: true,
      message: 'ลบบัญชีสำเร็จ'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
