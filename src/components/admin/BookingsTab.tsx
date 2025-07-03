import React, { useState } from 'react'
import { Check, X, Mail, Clock, AlertTriangle } from 'lucide-react'
import { format, parse, parseISO } from 'date-fns'
import { Booking } from '../../types'

interface BookingsTabProps {
  bookings: Booking[]
  onUpdateBookingStatus: (bookingId: string, status: string) => void
}

const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onUpdateBookingStatus }) => {
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: string }>({})
  const [showConfirmation, setShowConfirmation] = useState<{ [key: string]: boolean }>({})
  const [sendingEmails, setSendingEmails] = useState<{ [key: string]: boolean }>({})

  // Helper to format 24h string "17:30" → "05:30 PM"
  const formatTime12h = (time24: string) => {
    try {
      const parsed = parse(time24, 'HH:mm', new Date())
      return format(parsed, 'hh:mm a')
    } catch {
      return time24
    }
  }

  // Helper to format phone like "9024145894" or "+19024145894"
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    const match = digits.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`
    return raw
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const d = parseISO(dateString)
      return format(d, 'yyyy-LLL-dd h:mm a')
    } catch {
      return dateString
    }
  }

  const getDurationText = (durationHours: number) => {
    const days = Math.ceil(durationHours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const threeHoursLater = new Date(created.getTime() + 3 * 60 * 60 * 1000)
    const diff = threeHoursLater.getTime() - now.getTime()
    if (diff <= 0) return 'Expired'
    const hrs = Math.floor(diff / 3_600_000)
    const mins = Math.floor((diff % 3_600_000) / 60_000)
    return `${hrs}h ${mins}m left`
  }

  const isPendingExpired = (booking: Booking) => {
    if (booking.status !== 'pending') return false
    const created = new Date(booking.created_at)
    return Date.now() > created.getTime() + 3 * 60 * 60 * 1000
  }

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setPendingChanges(prev => ({ ...prev, [bookingId]: newStatus }))
    setShowConfirmation(prev => ({ ...prev, [bookingId]: true }))
  }

  const confirmStatusChange = async (bookingId: string) => {
    const newStatus = pendingChanges[bookingId]
    if (!newStatus) return
    setSendingEmails(prev => ({ ...prev, [bookingId]: true }))
    try {
      await onUpdateBookingStatus(bookingId, newStatus)
      setPendingChanges(prev => {
        const upd = { ...prev }
        delete upd[bookingId]
        return upd
      })
      setShowConfirmation(prev => ({ ...prev, [bookingId]: false }))
    } catch (err) {
      console.error('Update status failed', err)
    } finally {
      setSendingEmails(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  const cancelStatusChange = (bookingId: string) => {
    setPendingChanges(prev => {
      const upd = { ...prev }
      delete upd[bookingId]
      return upd
    })
    setShowConfirmation(prev => ({ ...prev, [bookingId]: false }))
  }

  const sendTestEmail = async (booking: Booking) => {
    setSendingEmails(prev => ({ ...prev, [booking.id]: true }))
    try {
      const res = await fetch('/.netlify/functions/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking,
          bike: booking.bikes,
          type: 'status_update',
          previousStatus: booking.status
        })
      })
      if (res.ok) alert('Test email sent successfully!')
      else {
        const err = await res.json()
        alert(`Failed: ${err.error}`)
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    } finally {
      setSendingEmails(prev => ({ ...prev, [booking.id]: false }))
    }
  }

  // Sort: pending first, then newest
  const sorted = [...bookings].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (b.status === 'pending' && a.status !== 'pending') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Booking Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer bookings & update status with emails
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {bookings.length} | Pending:{' '}
          {bookings.filter(b => b.status === 'pending').length} | Confirmed:{' '}
          {bookings.filter(b => b.status === 'confirmed').length}
        </div>
      </div>

      {bookings.some(b => b.status === 'pending') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-yellow-800 font-medium">
              {bookings.filter(b => b.status === 'pending').length} Pending Payment(s)
            </h3>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Bookings expire after 3 hours if not confirmed.
          </p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3a2 2 0 012-2h4a2 2 0
 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0
 012 2v0M8 7v10a2 2 0
 002 2h4a2 2 0
 002-2V7M8 7H6a2 2 0
 00-2 2v10a2 2 0
 002 2h12a2 2 0
 002-2V9a2 2 0
 00-2-2h-2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            No bookings yet
          </h3>
          <p className="text-gray-500 mt-1">
            They'll show up here as customers book.
          </p>
        </div>
      ) : (
        <div className="relative bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bike
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pick-up
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Drop-off
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50 z-10"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map(booking => {
                const expired = isPendingExpired(booking)
                return (
                  <tr
                    key={booking.id}
                    className={`hover:bg-gray-50 ${expired ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customer_name}
                      <div className="text-xs text-gray-500">
                        {formatPhone(booking.customer_phone)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.customer_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.bikes?.name || 'N/A'}
                      <div className="text-xs text-gray-500">
                        {booking.bikes?.type || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(booking.start_date)}<br/>
                      {formatDate(booking.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime12h(booking.pickup_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime12h(booking.dropoff_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDurationText(booking.duration_hours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${booking.total_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === 'pending' && (
                        <div className={`text-xs ${
                          expired ? 'text-red-600 font-bold' : 'text-yellow-600'
                        }`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {expired
                            ? 'EXPIRED'
                            : getTimeRemaining(booking.created_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky right-0 bg-white">
                      <div className="flex items-center space-x-2">
                        <select
                          value={pendingChanges[booking.id] || booking.status}
                          onChange={e =>
                            handleStatusChange(booking.id, e.target.value)
                          }
                          disabled={sendingEmails[booking.id]}
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {showConfirmation[booking.id] && (
                          <>
                            <button
                              onClick={() => confirmStatusChange(booking.id)}
                              disabled={sendingEmails[booking.id]}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded disabled:opacity-50 transition-colors"
                            >
                              {sendingEmails[booking.id] ? (
                                <div className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={() => cancelStatusChange(booking.id)}
                              disabled={sendingEmails[booking.id]}
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded disabled:opacity-50 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => sendTestEmail(booking)}
                          disabled={sendingEmails[booking.id]}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded disabled:opacity-50 transition-colors"
                          title="Send test email"
                        >
                          {sendingEmails[booking.id] ? (
                            <div className="animate-spin h-3 w-3 border-b-2 border-white rounded-full" />
                          ) : (
                            <Mail className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Special requests */}
      {bookings.some(b => b.special_requests) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Special Requests</h3>
          <div className="space-y-4">
            {bookings
              .filter(b => b.special_requests)
              .map(booking => (
                <div
                  key={booking.id}
                  className="border-l-4 border-blue-500 pl-4 bg-gray-50 p-3 rounded"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.customer_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.bikes?.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    {booking.special_requests}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Automated email info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <span className="text-blue-500 text-2xl">📧</span>
        <div>
          <h3 className="text-sm font-medium text-blue-800">
            Automated Email System
          </h3>
          <p className="text-sm text-blue-700 mt-2">
            Status changes automatically trigger notifications:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 mt-1 space-y-1">
            <li>
              <strong>Pending:</strong> Payment instructions sent.
            </li>
            <li>
              <strong>Confirmed:</strong> Pickup instructions sent.
            </li>
            <li>
              <strong>Cancelled:</strong> Cancellation notice sent.
            </li>
            <li>
              <strong>Completed:</strong> Thank you message sent.
            </li>
          </ul>
          <p className="text-sm font-medium text-blue-800 mt-2">
            💡 Use the mail icon to send test emails.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingsTab
