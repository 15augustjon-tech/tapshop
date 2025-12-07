import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/auth/buyer/logout
export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('buyer_id')
    cookieStore.delete('buyer_phone')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    )
  }
}
