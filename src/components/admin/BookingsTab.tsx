import React, { useState } from 'react'
import { Check, X, Mail, Clock, AlertTriangle } from 'lucide-react'
import { Booking } from '../../types'

interface BookingsTabProps {
  bookings: Booking[]
  onUpdateBookingStatus: (bookingId: string, status: string) => void
}

const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onUpdateBookingStatus }) => {
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: string}>({})
  const [showConfirmation, setShowConfirmation] = useState<{[key: string]: boolean}>({})
  const [sendingEmails, setSendingEmails] = useState<{[key: string]: boolean}>({})

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
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDurationText = (durationHours: number) => {
    const days = Math.ceil(durationHours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const threeHoursLater = new Date(created.getTime() + 3 * 60 * 60 * 1000)
    const timeLeft = threeHoursLater.getTime() - now.getTime()
    
    if (timeLeft <= 0) return 'Expired'
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m left`
  }

  const isPendingExpired = (booking: Booking) => {
    if (booking.status !== 'pending') return false
    
    const created = new Date(booking.created_at)
    const now = new Date()
    const threeHoursLater = new Date(created.getTime() + 3 * 60 * 60 * 1000)
    
    return now > threeHoursLater
  }

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setPendingChanges(prev => ({ ...prev, [bookingId]: newStatus }))
    setShowConfirmation(prev => ({ ...prev, [bookingId]: true }))
  }

  const confirmStatusChange = async (bookingId: string) => {
    const newStatus = pendingChanges[bookingId]
    if (newStatus) {
      setSendingEmails(prev => ({ ...prev, [bookingId]: true }))
      
      try {
        await onUpdateBookingStatus(bookingId, newStatus)
        
        setPendingChanges(prev => {
          const updated = { ...prev }
          delete updated[bookingId]
          return updated
        })
        setShowConfirmation(prev => ({ ...prev, [bookingId]: false }))
      } catch (error) {
        console.error('Failed to update booking status:', error)
      } finally {
        setSendingEmails(prev => ({ ...prev, [bookingId]: false }))
      }
    }
  }

  const cancelStatusChange = (bookingId: string) => {
    setPendingChanges(prev => {
      const updated = { ...prev }
      delete updated[bookingId]
      return updated
    })
    setShowConfirmation(prev => ({ ...prev, [bookingId]: false }))
  }

  const sendTestEmail = async (booking: Booking) => {
    setSendingEmails(prev => ({ ...prev, [booking.id]: true }))
    
    try {
      const response = await fetch('/.netlify/functions/send-booking-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking,
          bike: booking.bikes,
          type: 'status_update',
          previousStatus: booking.status
        })
      })

      if (response.ok) {
        alert('Test email sent successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to send email: ${error.error}`)
      }
    } catch (error) {
      alert(`Error sending email: ${error.message}`)
    } finally {
      setSendingEmails(prev => ({ ...prev, [booking.id]: false }))
    }
  }

  // Sort bookings: pending first, then by creation date
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Booking Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer bookings and update status with automatic email notifications
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Bookings: {bookings.length} | 
          Pending: {bookings.filter(b => b.status === 'pending').length} | 
          Confirmed: {bookings.filter(b => b.status === 'confirmed').length}
        </div>
      </div>

      {/* Pending Bookings Alert */}
      {bookings.filter(b => b.status === 'pending').length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-yellow-800 font-medium">
              {bookings.filter(b => b.status === 'pending').length} Pending Payment(s)
            </h3>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Monitor for e-transfers and confirm bookings once payment is received. 
            Bookings expire after 3 hours if payment is not received.
          </p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Bookings will appear here when customers make reservations.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bike
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBookings.map((booking) => {
                  const isExpired = isPendingExpired(booking)
                  return (
                    <tr key={booking.id} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.customer_email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.customer_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.bikes?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.bikes?.type || 'Unknown Type'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Start: {formatDate(booking.start_date)}</div>
                        <div>End: {formatDate(booking.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDurationText(booking.duration_hours)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${booking.total_cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {booking.status === 'pending' && (
                            <div className={`text-xs ${isExpired ? 'text-red-600 font-bold' : 'text-yellow-600'}`}>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {isExpired ? 'EXPIRED' : getTimeRemaining(booking.created_at)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <select
                            value={pendingChanges[booking.id] || booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sendingEmails[booking.id]}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          
                          {showConfirmation[booking.id] && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => confirmStatusChange(booking.id)}
                                disabled={sendingEmails[booking.id]}
                                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors disabled:opacity-50"
                                title="Confirm status change and send email"
                              >
                                {sendingEmails[booking.id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </button>
                              <button
                                onClick={() => cancelStatusChange(booking.id)}
                                disabled={sendingEmails[booking.id]}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors disabled:opacity-50"
                                title="Cancel status change"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => sendTestEmail(booking)}
                            disabled={sendingEmails[booking.id]}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors disabled:opacity-50"
                            title="Send test email"
                          >
                            {sendingEmails[booking.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
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
        </div>
      )}

      {/* Special requests section */}
      {bookings.some(booking => booking.special_requests) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Special Requests</h3>
          <div className="space-y-4">
            {bookings
              .filter(booking => booking.special_requests)
              .map((booking) => (
                <div key={booking.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customer_name}</p>
                      <p className="text-sm text-gray-600">{booking.bikes?.name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{booking.special_requests}</p>
                </div>
              ))}
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-500 text-lg">📧</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Automated Email System</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Status changes automatically trigger email notifications:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li><strong>Pending:</strong> Customer gets payment instructions, admin gets notification</li>
                <li><strong>Confirmed:</strong> Customer gets pickup instructions, admin gets confirmation</li>
                <li><strong>Cancelled:</strong> Customer gets cancellation notice, admin gets update</li>
                <li><strong>Completed:</strong> Customer gets thank you message, admin gets completion notice</li>
              </ul>
              <p className="mt-2 font-medium">💡 Use the mail icon to send test emails for any booking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingsTab