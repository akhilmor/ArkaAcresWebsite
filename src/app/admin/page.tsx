'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, LogOut, Key } from 'lucide-react'
import AdminBookings from '@/components/admin/AdminBookings'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.ok) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (error) {
      setError('Failed to login. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setIsAuthenticated(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordError(null)
    setChangePasswordSuccess(null)

    // Validation
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError('New passwords do not match')
      return
    }

    if (changePasswordData.newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters')
      return
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword,
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setChangePasswordSuccess(data.message)
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => {
          setShowChangePassword(false)
          setChangePasswordSuccess(null)
        }, 3000)
      } else {
        setChangePasswordError(data.error || 'Failed to change password')
      }
    } catch (error) {
      setChangePasswordError('Failed to change password. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-serif text-earth-800 font-bold mb-2">
              Admin Login
            </h1>
            <p className="text-neutral-600 text-sm">
              Enter password to access admin panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
            >
              Login
            </button>

            <div className="mt-4 text-center">
              <a
                href="/admin/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif text-earth-800 font-bold">
              Admin Panel
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors min-h-[44px]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap gap-4">
          <a
            href="/admin"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Bookings
          </a>
          <a
            href="/admin/diagnostics"
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors"
          >
            Diagnostics
          </a>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors"
          >
            <Key size={18} />
            Change Password
          </button>
        </div>

        {showChangePassword && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-earth-800 mb-4 flex items-center gap-2">
              <Key size={20} />
              Change Admin Password
            </h2>

            {changePasswordSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                {changePasswordSuccess}
              </div>
            )}

            {changePasswordError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {changePasswordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  required
                  value={changePasswordData.currentPassword}
                  onChange={(e) =>
                    setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  minLength={8}
                  value={changePasswordData.newPassword}
                  onChange={(e) =>
                    setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                  placeholder="Enter new password (min 8 characters)"
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
                  minLength={8}
                  value={changePasswordData.confirmPassword}
                  onChange={(e) =>
                    setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false)
                    setChangePasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                    setChangePasswordError(null)
                    setChangePasswordSuccess(null)
                  }}
                  className="px-6 py-2 bg-neutral-200 text-neutral-700 font-semibold rounded-md hover:bg-neutral-300 transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <AdminBookings />
      </div>
    </div>
  )
}

