import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns'
import { Booking, Bike } from '../../types'

interface BookingCalendarProps {
  bookings: Booking[]
  bikes: Bike[]
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookings, bikes }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days for proper calendar layout
  const startDay = monthStart.getDay()
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (startDay - i))
    return date
  })

  const endDay = monthEnd.getDay()
  const endPaddingDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + (i + 1))
    return date
  })

  const allDays = [...paddingDays, ...calendarDays, ...endPaddingDays]

  // Get bookings for a specific date with proper date comparison
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const startDate = new Date(booking.start_date)
      const endDate = new Date(booking.end_date)
      
      // Normalize dates to compare only the date part (ignore time)
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const bookingStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const bookingEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      // Check if the date falls within the booking period (inclusive)
      return checkDate >= bookingStart && checkDate <= bookingEnd &&
             (booking.status === 'confirmed' || booking.status === 'pending')
    })
  }

  // Get unique bikes booked on a date
  const getBikesForDate = (date: Date) => {
    const dateBookings = getBookingsForDate(date)
    const bikeIds = [...new Set(dateBookings.map(b => b.bike_id))]
    return bikeIds.map(id => bikes.find(bike => bike.id === id)).filter(Boolean) as Bike[]
  }

  const getDayClassName = (date: Date) => {
    const baseClasses = "min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
    
    if (!isSameMonth(date, currentMonth)) {
      return `${baseClasses} bg-gray-50 text-gray-400`
    }
    
    if (isToday(date)) {
      return `${baseClasses} bg-blue-50 border-blue-300`
    }
    
    if (selectedDate && isSameDay(date, selectedDate)) {
      return `${baseClasses} bg-blue-100 border-blue-400`
    }
    
    return `${baseClasses} bg-white`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {allDays.map((date, index) => {
          const dayBookings = getBookingsForDate(date)
          const dayBikes = getBikesForDate(date)
          
          return (
            <div
              key={index}
              className={getDayClassName(date)}
              onClick={() => setSelectedDate(date)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${
                  !isSameMonth(date, currentMonth) ? 'text-gray-400' : 
                  isToday(date) ? 'text-blue-600 font-bold' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {dayBookings.length}
                  </span>
                )}
              </div>
              
              {/* Show bike indicators */}
              <div className="space-y-1">
                {dayBikes.slice(0, 2).map((bike, bikeIndex) => {
                  const booking = dayBookings.find(b => b.bike_id === bike.id)
                  return (
                    <div
                      key={bikeIndex}
                      className={`text-xs px-1 py-0.5 rounded border ${getStatusColor(booking?.status || 'pending')}`}
                      title={`${bike.name} - ${booking?.customer_name} (${booking?.status})`}
                    >
                      {bike.name.substring(0, 8)}...
                    </div>
                  )
                })}
                {dayBikes.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayBikes.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Bookings for {format(selectedDate, 'MMMM dd, yyyy')}
          </h4>
          
          {selectedDateBookings.length === 0 ? (
            <p className="text-gray-500">No bookings for this date</p>
          ) : (
            <div className="space-y-3">
              {selectedDateBookings.map((booking) => {
                const bike = bikes.find(b => b.id === booking.bike_id)
                return (
                  <div key={booking.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-600">{bike?.name} ({bike?.type})</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd')}
                        </p>
                        <p className="text-sm text-gray-500">${booking.total_cost}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  )
}

export default BookingCalendar