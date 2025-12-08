import { NextResponse } from 'next/server'
import { clearSellerSession } from '@/lib/auth'

export async function POST() {
  try {
    await clearSellerSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Seller logout error:', error)
    return NextResponse.json({ success: true }) // Always return success for logout
  }
}
