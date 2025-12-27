'use client'

import { useState } from 'react'
import { Lock, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setDevResetUrl(null)

    try {
      // Normalize email (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim()

      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json()

      if (data.ok) {
        setSuccess(true)
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl)
        }
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (devResetUrl) {
      await navigator.clipboard.writeText(devResetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-serif text-earth-800 font-bold mb-2">
            Forgot Password
          </h1>
          <p className="text-neutral-600 text-sm">
            Enter your email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">Reset link sent!</p>
              <p>If that email exists, we sent a reset link. Check your inbox.</p>
            </div>

            {devResetUrl && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">
                  Development Mode: Email provider not configured
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Use this link to reset your password:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={devResetUrl}
                    className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded text-xs font-mono text-amber-900"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-amber-200 text-amber-900 rounded hover:bg-amber-300 transition-colors flex items-center gap-1"
                    title="Copy link"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}

            <Link
              href="/admin"
              className="block w-full text-center px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                placeholder="Enter your admin email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
        )}
      </div>
    </div>
  )
}

