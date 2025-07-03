// src/components/AdminDashboard.tsx

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Clock,
  RefreshCw
} from 'lucide-react'
import BookingCalendar from './BookingCalendar'
import { Bike, Booking, SiteVisit } from '../../types'

interface AdminDashboardProps {
  bikes: Bike[]
  bookings: Booking[]
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ bikes, bookings }) => {
  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [loadingVisits, setLoadingVisits] = useState(false)

  const fetchVisits = async (range: 'today' | 'week' | 'month' | 'all' = 'week') => {
    console.log('🕵️‍♂️ fetchVisits(): starting…')
    setLoadingVisits(true)
    try {
      const url = `/.netlify/functions/get-site-visits?range=${range}`
      console.log('🕵️‍♂️ fetching URL:', url)
      
      const res = await fetch(url)
      console.log('🕵️‍♂️ response status:', res.status, res.statusText)
      console.log('🕵️‍♂️ content-type:', res.headers.get('content-type'))
      
      const text = await res.text()
      console.log('🕵️‍♂️ raw response (first 500 chars):\n', text.slice(0, 500))
      
      let data: any
      try {
        data = JSON.parse(text)
        console.log('🕵️‍♂️ parsed JSON:', data)
      } catch (e) {
        console.error('🕵️‍♂️ JSON.parse failed:', e)
        return
      }

      setVisits(data.visits || [])
      console.log(`🕵️‍♂️ setVisits → ${ (data.visits || []).length } records`)
    } catch (err) {
      console.error('🕵️‍♂️ Error fetching visits:', err)
    } finally {
      setLoadingVisits(false)
      console.log('🕵️‍♂️ fetchVisits(): done')
    }
  }

  useEffect(() => {
    fetchVisits('week')
  }, [])

  // Debug: log visits state whenever it changes
  useEffect(() => {
    console.log('🕵️‍♂️ visits state updated:', visits)
  }, [visits])

  // Compute Halifax “today” window
  const now = new Date()
  const halifaxNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Halifax' })
  )
  const todayStart = new Date(
    halifaxNow.getFullYear(),
    halifaxNow.getMonth(),
    halifaxNow.getDate()
  )
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const todayVisits = visits.filter(v => {
    const d = new Date(v.visited_at)
    return d >= todayStart && d < todayEnd
  }).length

  const weekStart = new Date(halifaxNow)
  weekStart.setDate(halifaxNow.getDate() - halifaxNow.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekVisits = visits.filter(v => {
    const d = new Date(v.visited_at)
    return d >= weekStart
  }).length

  const todayBookings = bookings.filter(b => {
    const d = new Date(b.created_at)
    return d >= todayStart && d < todayEnd
  }).length

  const todayRevenue = bookings
    .filter(b => {
      const d = new Date(b.created_at)
      return (
        d >= todayStart &&
        d < todayEnd &&
        (b.status === 'confirmed' || b.status === 'completed')
      )
    })
    .reduce((sum, b) => sum + parseFloat(b.total_cost.toString()), 0)

  return (
    <div className="space-y-6">
      {/* Current Time + Refresh */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">
            Current Halifax Time
          </h3>
          <p className="text-blue-700 text-lg font-mono">
            {halifaxNow.toLocaleString('en-CA', {
              timeZone: 'America/Halifax',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
        <button
          onClick={() => fetchVisits('week')}
          disabled={loadingVisits}
          className="p-2 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
          title="Refresh visits"
        >
          <RefreshCw
            className={`h-6 w-6 text-blue-600 ${
              loadingVisits ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      {/* Today's Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Today's Performance (Halifax)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Site Visits */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  Site Visits Today
                </h4>
                <p className="text-3xl font-bold text-blue-600">
                  {todayVisits}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {weekVisits} this week
            </p>
          </div>

          {/* New Bookings */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  New Bookings
                </h4>
                <p className="text-3xl font-bold text-green-600">
                  {todayBookings}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {bookings.filter(b => b.status === 'pending').length} pending
            </p>
          </div>

          {/* Today's Revenue */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  Today's Revenue
                </h4>
                <p className="text-3xl font-bold text-purple-600">
                  ${todayRevenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Confirmed & completed
            </p>
          </div>

          {/* Available Bikes */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  Available Bikes
                </h4>
                <p className="text-3xl font-bold text-orange-600">
                  {bikes.filter(b => b.available).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              of {bikes.length} total
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Booking Calendar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Monthly Booking Calendar
        </h3>
        <BookingCalendar bookings={bookings} bikes={bikes} />
      </div>
    </div>
  )
}

export default AdminDashboard
