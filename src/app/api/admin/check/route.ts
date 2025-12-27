import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')

    return NextResponse.json({
      authenticated: session?.value === 'authenticated',
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

