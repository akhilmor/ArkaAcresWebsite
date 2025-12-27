'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface HealthData {
  db: string
  bookingColumnsReady: boolean
  notificationLogReady: boolean
  emailProvider: 'resend' | 'smtp' | 'none'
  resendConfigured: boolean
  smtpConfigured: boolean
  emailFromConfigured: boolean
  twilioConfigured: boolean
  twilioFromConfigured: boolean
  twilioFromNumberValid: boolean
  guestSmsEnabled: boolean
  runtime: {
    nodeEnv: string
  }
}

interface DiagnosticsData {
  ok: boolean
  bookings: any[]
  notifications: any[]
  logs: any[]
  envCheck: any
}

export default function DiagnosticsPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [healthRes, diagRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/admin/diagnostics'),
      ])

      if (!healthRes.ok) {
        throw new Error('Failed to fetch health data')
      }

      const healthData = await healthRes.json()
      setHealth(healthData)

      if (diagRes.ok) {
        const diagData = await diagRes.json()
        setDiagnostics(diagData)
      } else {
        // Not authenticated
        router.push('/admin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load diagnostics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Loading diagnostics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-serif text-earth-800 font-bold">System Diagnostics</h1>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Health Status */}
        {health && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-earth-800 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Health Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatusCard
                label="Database"
                status={health.db === 'ok'}
                value={health.db}
              />
              <StatusCard
                label="Email Provider"
                status={health.emailProvider !== 'none'}
                value={health.emailProvider === 'resend' ? 'Resend' : health.emailProvider === 'smtp' ? 'SMTP' : 'None'}
              />
              <StatusCard
                label="Resend Configured"
                status={health.resendConfigured}
                value={health.resendConfigured ? 'Yes' : 'No'}
              />
              <StatusCard
                label="SMTP Configured"
                status={health.smtpConfigured}
                value={health.smtpConfigured ? 'Yes' : 'No'}
              />
              <StatusCard
                label="Email From"
                status={health.emailFromConfigured}
                value={health.emailFromConfigured ? 'Configured' : 'Missing'}
              />
              <StatusCard
                label="Twilio Configured"
                status={health.twilioConfigured}
                value={health.twilioConfigured ? 'Yes' : 'No'}
              />
              <StatusCard
                label="Twilio From Number"
                status={health.twilioFromConfigured && health.twilioFromNumberValid}
                value={health.twilioFromConfigured ? (health.twilioFromNumberValid ? 'Valid' : 'Invalid') : 'Missing'}
              />
              <StatusCard
                label="Booking Columns"
                status={health.bookingColumnsReady}
                value={health.bookingColumnsReady ? 'Ready' : 'Schema mismatch'}
              />
              <StatusCard
                label="NotificationLog Table"
                status={health.notificationLogReady}
                value={health.notificationLogReady ? 'Ready' : 'Not migrated'}
              />
              <StatusCard
                label="Guest SMS"
                status={health.guestSmsEnabled}
                value={health.guestSmsEnabled ? 'Enabled' : 'Disabled'}
              />
              <StatusCard
                label="Environment"
                status={true}
                value={health.runtime.nodeEnv}
              />
            </div>
          </div>
        )}

        {/* Server Logs */}
        {diagnostics && diagnostics.logs && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-earth-800 mb-4">Server Logs (Last 200)</h2>
            <div className="bg-neutral-900 text-green-400 font-mono text-xs p-4 rounded overflow-auto max-h-96">
              {diagnostics.logs.length === 0 ? (
                <p className="text-neutral-500">No logs yet</p>
              ) : (
                diagnostics.logs.map((log: any, idx: number) => (
                  <div key={idx} className="mb-1">
                    <span className="text-neutral-500">[{log.timestamp}]</span>{' '}
                    <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'}>
                      [{log.level.toUpperCase()}]
                    </span>{' '}
                    {log.message}
                    {log.context && (
                      <pre className="ml-4 mt-1 text-neutral-400">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Notification Logs */}
        {diagnostics && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-earth-800 mb-4">Notification Logs (Last 50)</h2>
            {diagnostics.notifications && diagnostics.notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Booking ID</th>
                      <th className="px-4 py-2 text-left">Audience</th>
                      <th className="px-4 py-2 text-left">Channel</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Provider ID</th>
                      <th className="px-4 py-2 text-left">Error</th>
                      <th className="px-4 py-2 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {diagnostics.notifications.map((notif: any) => (
                      <tr key={notif.id}>
                        <td className="px-4 py-2 font-mono text-xs">{notif.bookingId.slice(0, 8)}...</td>
                        <td className="px-4 py-2">{notif.audience}</td>
                        <td className="px-4 py-2">{notif.channel}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            notif.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {notif.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">{notif.providerMessageId || '-'}</td>
                        <td className="px-4 py-2 text-xs text-red-600 max-w-xs truncate" title={notif.errorMessage || ''}>
                          {notif.errorMessage || '-'}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-500">
                          {new Date(notif.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-500">
                  {health && !health.notificationLogReady
                    ? 'NotificationLog table not migrated yet.'
                    : 'No notification logs yet'}
                </p>
                
                {/* Schema Mismatch Warning */}
                {health && !health.bookingColumnsReady && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Schema Mismatch Detected</p>
                    <p className="text-sm text-amber-700 mb-3">
                      Booking notification status columns are missing. To fix:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800 mb-3 ml-2">
                      <li>Stop the dev server (Ctrl+C)</li>
                      <li>Run: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">npx prisma generate</code></li>
                      <li>Run: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">npx prisma db push</code></li>
                      <li>Restart: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">npm run dev</code></li>
                    </ol>
                    <p className="text-xs text-amber-600 italic">
                      Note: Bookings will still work without these columns, but notification status tracking will be limited.
                    </p>
                  </div>
                )}
                
                {/* NotificationLog Migration Warning */}
                {health && !health.notificationLogReady && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-2">NotificationLog Not Ready</p>
                    <p className="text-sm text-blue-700 mb-2">
                      To enable notification logging, run:
                    </p>
                    <code className="block bg-blue-100 p-2 rounded text-xs font-mono text-blue-900">
                      npx prisma migrate dev
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Environment Check */}
        {diagnostics && diagnostics.envCheck && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold text-earth-800 mb-4">Environment Check</h2>
            
            {/* Provider Status Summary */}
            <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Provider Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Email Provider Available:</span>
                  <span className={`text-sm font-semibold ${diagnostics.envCheck.hasEmailProvider ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostics.envCheck.hasEmailProvider ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">SMS Provider Available:</span>
                  <span className={`text-sm font-semibold ${diagnostics.envCheck.hasTwilio ? 'text-green-600' : 'text-red-600'}`}>
                    {diagnostics.envCheck.hasTwilio ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Setup Guidance */}
            {(!diagnostics.envCheck.hasEmailProvider || !diagnostics.envCheck.hasTwilio) && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">Setup Required</h3>
                {!diagnostics.envCheck.hasEmailProvider && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-amber-800 mb-1">Email Provider:</p>
                    <div className="text-xs text-amber-700 space-y-1 ml-2">
                      <p><strong>Option 1 - Resend:</strong> Set RESEND_API_KEY + EMAIL_FROM (verified domain)</p>
                      <p><strong>Option 2 - SMTP:</strong> Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS</p>
                    </div>
                  </div>
                )}
                {!diagnostics.envCheck.hasTwilio && (
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">SMS Provider:</p>
                    <p className="text-xs text-amber-700 ml-2">
                      Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, SMS_TO_NUMBER
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* All Environment Variables */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">All Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(diagnostics.envCheck).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                    <span className="text-sm font-medium text-neutral-700">{key}</span>
                    <span className={`text-sm font-semibold ${
                      value ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusCard({ label, status, value }: { label: string; status: boolean; value: string }) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        {status ? (
          <CheckCircle className="text-green-600" size={20} />
        ) : (
          <XCircle className="text-red-600" size={20} />
        )}
      </div>
      <p className={`text-lg font-semibold ${status ? 'text-green-600' : 'text-red-600'}`}>
        {value}
      </p>
    </div>
  )
}

