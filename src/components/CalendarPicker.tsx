import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, MousePointer2 } from 'lucide-react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, addMonths, subMonths, parseISO } from 'date-fns'

interface CalendarPickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void
  bookedDates?: Date[]
  minDate?: Date
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ 
  onDateRangeChange, 
  bookedDates = [],
  minDate = new Date()
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

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

  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    const isBooked = bookedDates.some(bookedDate => {
      const bookedDateStr = bookedDate.toISOString().split('T')[0]
      return dateStr === bookedDateStr
    })

    return isBooked
  }

  const isDateDisabled = (date: Date) => {
    const isPast = isBefore(date, minDate)
    const isBooked = isDateBooked(date)
    return isPast || isBooked
  }

  const isDateInRange = (date: Date) => {
    if (!startDate) return false
    
    const rangeEnd = endDate || hoverDate
    if (!rangeEnd) return isSameDay(date, startDate)
    
    const start = startDate
    const end = rangeEnd
    
    return (isAfter(date, start) || isSameDay(date, start)) && 
           (isBefore(date, end) || isSameDay(date, end))
  }

  const handleDayClick = (date: Date) => {
    if (isDateDisabled(date)) {
      return
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date)
      setEndDate(null)
      onDateRangeChange(date, null)
    } else if (date > startDate) {
      // Set end date
      setEndDate(date)
      onDateRangeChange(startDate, date)
    } else {
      // Clicked date is before start, make it new start
      setStartDate(date)
      setEndDate(null)
      onDateRangeChange(date, null)
    }
  }

  const handleMouseEnter = (date: Date) => {
    if (!isDateDisabled(date)) {
      setHoverDate(date)
    }
  }

  const handleMouseLeave = () => {
    setHoverDate(null)
  }

  const getDayClassName = (date: Date) => {
    const baseClasses = "w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 select-none cursor-pointer relative"
    
    if (!isSameMonth(date, currentMonth)) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`
    }
    
    if (isDateDisabled(date)) {
      if (isDateBooked(date)) {
        return `${baseClasses} bg-red-100 text-red-800 cursor-not-allowed border-2 border-red-300 font-bold`
      }
      return `${baseClasses} text-gray-300 cursor-not-allowed`
    }
    
    // Check if this date is the start or end of selection
    const isStart = startDate && isSameDay(date, startDate)
    const isEnd = endDate && isSameDay(date, endDate)
    
    if (isStart || isEnd) {
      return `${baseClasses} bg-blue-500 text-white border-2 border-blue-600 shadow-lg transform scale-105 z-10`
    }
    
    if (isDateInRange(date)) {
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-300`
    }
    
    // Hover effects
    if (hoverDate && isSameDay(date, hoverDate)) {
      return `${baseClasses} bg-blue-50 text-blue-600 border border-blue-200`
    }
    
    return `${baseClasses} text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200`
  }

  const formatDateRange = () => {
    if (!startDate) return "Select dates"
    if (!endDate) return format(startDate, 'MMM dd, yyyy')
    
    if (isSameDay(startDate, endDate)) {
      return `${format(startDate, 'MMM dd, yyyy')} (Same day)`
    }
    
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`
  }

  const getDayCount = () => {
    if (!startDate) return 0
    if (!endDate) return 1
    
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Select Rental Dates</h3>
        </div>
        <div className="text-sm text-gray-600">
          {formatDateRange()}
          {getDayCount() > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {getDayCount()} day{getDayCount() > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
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
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div 
        className="grid grid-cols-7 gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {allDays.map((date, index) => {
          const isBooked = isDateBooked(date)
          return (
            <div
              key={index}
              className={getDayClassName(date)}
              onClick={() => handleDayClick(date)}
              onMouseEnter={() => handleMouseEnter(date)}
              title={isBooked ? `Booked: ${date.toLocaleDateString()}` : date.toLocaleDateString()}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300"></div>
            <span className="text-gray-600">In Range</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded border-2 border-red-300"></div>
            <span className="text-gray-600">Booked ({bookedDates.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-start space-x-2">
            <MousePointer2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-1">How to select dates:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Click method:</strong> Click start date, then click end date</li>
                <li>• <strong>Same-day rentals:</strong> Click once for single day rental</li>
                <li>• <strong>Red dates:</strong> Already booked by other customers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPicker