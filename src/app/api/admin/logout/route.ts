import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: true }) // Always return success
  }
}

