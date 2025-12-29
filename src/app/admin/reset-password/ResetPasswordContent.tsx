'use client'

import { useSearchParams } from 'next/navigation'
import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  return <ResetPasswordForm token={token} />
}

