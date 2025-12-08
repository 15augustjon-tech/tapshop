import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()

  const session = cookieStore.get('admin_session')
  const sessionValid = cookieStore.get('admin_session_valid')

  if (!session || !sessionValid || sessionValid.value !== 'true') {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
