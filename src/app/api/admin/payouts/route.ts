import { NextResponse } from 'next/server'
import { getAuthenticatedAdmin } from '@/lib/admin'

// GET /api/admin/payouts - Get payout data (placeholder)
export async function GET() {
  const auth = await getAuthenticatedAdmin()
  if (!auth.success) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  // Placeholder - payout tracking to be implemented
  return NextResponse.json({
    success: true,
    payouts: [],
    message: 'Payout tracking coming soon'
  })
}

// POST /api/admin/payouts - Mark payout as completed (placeholder)
export async function POST() {
  const auth = await getAuthenticatedAdmin()
  if (!auth.success) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    success: false,
    error: 'not_implemented',
    message: 'Payout tracking coming soon'
  }, { status: 501 })
}
