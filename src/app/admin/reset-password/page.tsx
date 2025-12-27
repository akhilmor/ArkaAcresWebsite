'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering (uses searchParams)
export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Reset token is missing')
      return
    }

    // Trim passwords
    const trimmedNew = newPassword.trim()
    const trimmedConfirm = confirmPassword.trim()

    if (trimmedNew !== trimmedConfirm) {
      setError('Passwords do not match')
      return
    }

    if (trimmedNew.length < 10) {
      setError('Password must be at least 10 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: trimmedNew,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-red-600" size={32} />
            </div>
            <h1 className="text-2xl font-serif text-earth-800 font-bold mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-neutral-600 text-sm mb-4">
              The reset link is missing or invalid. Please request a new one.
            </p>
            <Link
              href="/admin/forgot-password"
              className="inline-block px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl font-serif text-earth-800 font-bold mb-2">
              Password Reset Successful
            </h1>
            <p className="text-neutral-600 text-sm mb-4">
              Your password has been reset. Redirecting to login...
            </p>
            <Link
              href="/admin"
              className="inline-block px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-serif text-earth-800 font-bold mb-2">
            Reset Password
          </h1>
          <p className="text-neutral-600 text-sm">
            Enter your new password (minimum 10 characters)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              required
              minLength={10}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
              placeholder="Enter new password (min 10 characters)"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              minLength={10}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <Link
              href="/admin"
              className="text-sm text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

