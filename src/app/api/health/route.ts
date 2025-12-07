import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Health check endpoint to verify all connections
export async function GET() {
  const results: Record<string, { status: string; error?: string }> = {}

  // Check Supabase connection and tables
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check otp_codes table exists
    const { error: otpError } = await supabase
      .from('otp_codes')
      .select('id')
      .limit(1)

    if (otpError) {
      results.supabase_otp_codes = { status: 'error', error: otpError.message }
    } else {
      results.supabase_otp_codes = { status: 'ok' }
    }

    // Check sellers table exists
    const { error: sellersError } = await supabase
      .from('sellers')
      .select('id')
      .limit(1)

    if (sellersError) {
      results.supabase_sellers = { status: 'error', error: sellersError.message }
    } else {
      results.supabase_sellers = { status: 'ok' }
    }

  } catch (e) {
    results.supabase = { status: 'error', error: String(e) }
  }

  // Check env vars are set (not their values, just presence)
  results.env_twilio = {
    status: process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER ? 'ok' : 'missing'
  }

  results.env_google_maps = {
    status: process.env.GOOGLE_MAPS_API_KEY ? 'ok' : 'missing'
  }

  results.env_lalamove = {
    status: process.env.LALAMOVE_API_KEY &&
            process.env.LALAMOVE_API_SECRET ? 'ok' : 'missing'
  }

  results.env_line = {
    status: process.env.LINE_CHANNEL_ACCESS_TOKEN &&
            process.env.LINE_CHANNEL_SECRET ? 'ok' : 'missing'
  }

  // Overall status
  const allOk = Object.values(results).every(r => r.status === 'ok')

  return NextResponse.json({
    overall: allOk ? 'all_systems_go' : 'issues_found',
    checks: results,
    timestamp: new Date().toISOString()
  })
}
