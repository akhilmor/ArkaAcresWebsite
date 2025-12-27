'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Trash2, Plus, Mail, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  unit: { name: string; slug: string }
  status: string
  name: string
  email: string
  phone: string | null
  guests: number | null
  checkIn: string | null
  checkOut: string | null
  eventDate: string | null
  startTime: string | null
  endTime: string | null
  eventType: string | null
  notes: string | null
  createdAt: string
  ownerEmailStatus?: string
  ownerSmsStatus?: string
  guestEmailStatus?: string
  guestSmsStatus?: string
  lastNotificationError?: string | null
}

interface BlockedRange {
  id: string
  unit: { name: string; slug: string }
  startDate: string
  endDate: string
  reason: string | null
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blocks, setBlocks] = useState<BlockedRange[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [blockForm, setBlockForm] = useState({
    unitSlug: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, blocksRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/blocks'),
      ])

      const bookingsData = await bookingsRes.json()
      const blocksData = await blocksRes.json()

      if (bookingsData.ok) {
        setBookings(bookingsData.bookings)
      }
      if (blocksData.ok) {
        setBlocks(blocksData.blocks)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.ok) {
        fetchData()
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm),
      })

      const data = await response.json()
      if (data.ok) {
        setShowBlockForm(false)
        setBlockForm({ unitSlug: '', startDate: '', endDate: '', reason: '' })
        fetchData()
      } else {
        alert(data.error || 'Failed to create block')
      }
    } catch (error) {
      alert('Failed to create block')
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return

    try {
      const response = await fetch(`/api/admin/blocks/${blockId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.ok) {
        fetchData()
      } else {
        alert(data.error || 'Failed to delete block')
      }
    } catch (error) {
      alert('Failed to delete block')
    }
  }

  const handleResendNotification = async (
    bookingId: string,
    audience: 'owner' | 'guest',
    channel: 'email' | 'sms',
    messageType: 'guest_receipt' | 'guest_confirmed' | 'owner_new_request',
    force: boolean = true
  ) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          channel,
          messageType,
          force,
        }),
      })

      const data = await response.json()
      if (data.ok) {
        alert(`${audience === 'owner' ? 'Owner' : 'Guest'} ${channel.toUpperCase()} resent successfully`)
        fetchData()
      } else {
        alert(data.error || `Failed to resend ${channel}`)
      }
    } catch (error) {
      alert(`Failed to resend ${channel}`)
    }
  }

  const getStatusBadge = (status: string | undefined, type: 'email' | 'sms') => {
    if (!status || status === 'not_sent') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-600">
          Not sent
        </span>
      )
    }
    if (status === 'sent') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Sent
        </span>
      )
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Failed
      </span>
    )
  }

  const filteredBookings = bookings.filter((b) => {
    if (selectedUnit !== 'all' && b.unit.slug !== selectedUnit) return false
    if (selectedStatus !== 'all' && b.status !== selectedStatus) return false
    return true
  })

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Bookings Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-serif text-earth-800 font-bold">Bookings</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-md text-sm min-h-[44px]"
            >
              <option value="all">All Units</option>
              <option value="the-white-house">The White House</option>
              <option value="red-roost">Red Roost</option>
              <option value="aurora-grand">Aurora Grand</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-md text-sm min-h-[44px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Booking Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Notifications</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-earth-800">{booking.unit.name}</div>
                        <div className="text-xs text-neutral-500">{booking.unit.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-neutral-900">{booking.name}</div>
                        <div className="text-xs text-neutral-500">{booking.email}</div>
                        {booking.phone && (
                          <div className="text-xs text-neutral-500">{booking.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {booking.checkIn && booking.checkOut ? (
                          <>
                            <div>{format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
                            <div className="text-xs text-neutral-500">to {format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
                            {booking.guests && <div className="text-xs text-neutral-500">{booking.guests} guests</div>}
                          </>
                        ) : booking.eventDate ? (
                          <>
                            <div>{format(new Date(booking.eventDate), 'MMM d, yyyy')}</div>
                            {booking.startTime && booking.endTime && (
                              <div className="text-xs text-neutral-500">{booking.startTime} - {booking.endTime}</div>
                            )}
                            {booking.guests && <div className="text-xs text-neutral-500">{booking.guests} attendees</div>}
                          </>
                        ) : (
                          <span className="text-neutral-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-neutral-600">Owner:</div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(booking.ownerEmailStatus, 'email')}
                              <button
                                onClick={() => handleResendNotification(booking.id, 'owner', 'email', 'owner_new_request', true)}
                                className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Resend Owner Email"
                              >
                                <Mail size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(booking.ownerSmsStatus, 'sms')}
                              <button
                                onClick={() => handleResendNotification(booking.id, 'owner', 'sms', 'owner_new_request', true)}
                                className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Resend Owner SMS"
                              >
                                <MessageSquare size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-neutral-600">Guest:</div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(booking.guestEmailStatus, 'email')}
                              <button
                                onClick={() => handleResendNotification(booking.id, 'guest', 'email', booking.status === 'confirmed' ? 'guest_confirmed' : 'guest_receipt', true)}
                                className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="Resend Guest Email"
                              >
                                <Mail size={14} />
                              </button>
                            </div>
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleResendNotification(booking.id, 'guest', 'email', 'guest_confirmed', true)}
                                className="text-xs text-primary hover:underline"
                              >
                                Send Confirmation
                              </button>
                            )}
                          </div>
                          {booking.lastNotificationError && (
                            <div className="text-xs text-red-600 max-w-xs truncate" title={booking.lastNotificationError}>
                              Error: {booking.lastNotificationError}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Confirm"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Cancel"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Blocked Dates Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-serif text-earth-800 font-bold">Blocked Dates</h2>
          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
          >
            <Plus size={18} />
            Block Dates
          </button>
        </div>

        {showBlockForm && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-earth-800 mb-4">Create Block</h3>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Unit *</label>
                  <select
                    required
                    value={blockForm.unitSlug}
                    onChange={(e) => setBlockForm({ ...blockForm, unitSlug: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md min-h-[44px]"
                  >
                    <option value="">Select unit</option>
                    <option value="the-white-house">The White House</option>
                    <option value="red-roost">Red Roost</option>
                    <option value="aurora-grand">Aurora Grand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Reason (optional)</label>
                  <input
                    type="text"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md min-h-[44px]"
                    placeholder="e.g., Maintenance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={blockForm.startDate}
                    onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    required
                    value={blockForm.endDate}
                    onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                    min={blockForm.startDate}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md min-h-[44px]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-colors min-h-[44px]"
                >
                  Create Block
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBlockForm(false)
                    setBlockForm({ unitSlug: '', startDate: '', endDate: '', reason: '' })
                  }}
                  className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Date Range</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {blocks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                      No blocked dates
                    </td>
                  </tr>
                ) : (
                  blocks.map((block) => (
                    <tr key={block.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm font-medium text-earth-800">{block.unit.name}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {format(new Date(block.startDate), 'MMM d, yyyy')} - {format(new Date(block.endDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">{block.reason || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

