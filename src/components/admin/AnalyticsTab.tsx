import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, Globe, Clock, RefreshCw, Trash2 } from 'lucide-react'
import { SiteVisit } from '../../types'

interface AnalyticsTabProps {
  siteVisits: SiteVisit[]
}

interface AnalyticsData {
  totalVisits: number
  uniqueVisitors: number
  topPages: Array<{ page: string; visits: number }>
  topReferrers: Array<{ referrer: string; visits: number }>
  hourlyData: Array<{ hour: number; visits: number }>
  dailyData: Array<{ date: string; visits: number }>
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ siteVisits }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [isCleaningData, setIsCleaningData] = useState(false)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      console.log('Fetching analytics from serverless function...')
    const response = await fetch(
        `/.netlify/functions/get-analytics?range=${timeRange}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data received:', data)
        setAnalytics(data)
      } else {
        throw new Error('HTTP ${response.status}: ${response.statusText}')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      
      // Fallback to client-side processing
      console.log('Using client-side analytics processing...')
      processAnalyticsClientSide()
    } finally {
      setLoading(false)
    }
  }

  const cleanBoltNewData = async () => {
    if (!confirm('Are you sure you want to remove all bolt.new tracking data? This action cannot be undone.')) {
      return
    }

    setIsCleaningData(true)
    try {
      console.log('Cleaning bolt.new tracking data...')
      
      const response = await fetch('/.netlify/functions/clean-analytics-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clean_bolt_new'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Cleanup result:', result)
        alert('Successfully removed ${result.deletedCount || 0} bolt.new tracking entries')
        
        // Refresh analytics data
        fetchAnalytics()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clean data')
      }
    } catch (error) {
      console.error('Error cleaning bolt.new data:', error)
      alert('Failed to clean data: ${error.message}')
    } finally {
      setIsCleaningData(false)
    }
  }

  const processAnalyticsClientSide = () => {
    const now = new Date()
    let filteredVisits = siteVisits

    // Filter by time range
    switch (timeRange) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        filteredVisits = siteVisits.filter(visit => new Date(visit.visited_at) >= todayStart)
        break
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filteredVisits = siteVisits.filter(visit => new Date(visit.visited_at) >= weekStart)
        break
      case 'month':
        const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredVisits = siteVisits.filter(visit => new Date(visit.visited_at) >= monthStart)
        break
      default:
        filteredVisits = siteVisits
    }

    // Process analytics
    const totalVisits = filteredVisits.length
    const uniqueVisitors = new Set(filteredVisits.map(v => v.user_agent)).size

    // Top pages
    const pageVisits = filteredVisits.reduce((acc, visit) => {
      acc[visit.page] = (acc[visit.page] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topPages = Object.entries(pageVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, visits]) => ({ page, visits }))

    // Top referrers (filter out bolt.new and development domains)
    const referrerVisits = filteredVisits.reduce((acc, visit) => {
      let referrer = visit.referrer || 'Direct'
      
      // Skip bolt.new and development referrers
      if (referrer.includes('bolt.new') || 
          referrer.includes('webcontainer') || 
          referrer.includes('local-credentialless')) {
        return acc
      }
      
      acc[referrer] = (acc[referrer] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topReferrers = Object.entries(referrerVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([referrer, visits]) => ({ referrer, visits }))

    // Hourly data (for today)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const visits = filteredVisits.filter(visit => {
        const visitHour = new Date(visit.visited_at).getHours()
        return visitHour === hour
      }).length
      return { hour, visits }
    })

    // Daily data (for week/month)
    const dailyData: Array<{ date: string; visits: number }> = []
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 1
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const visits = filteredVisits.filter(visit => {
        const visitDate = new Date(visit.visited_at)
        return visitDate >= dayStart && visitDate < dayEnd
      }).length
      
      dailyData.push({ date: dateStr, visits })
    }

    setAnalytics({
      totalVisits,
      uniqueVisitors,
      topPages,
      topReferrers,
      hourlyData,
      dailyData
    })
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const formatPageName = (page: string) => {
    if (page === '/') return 'Home'
    if (page === '/admin') return 'Admin'
    return page
  }

  const formatReferrer = (referrer: string) => {
    if (referrer === 'Direct' || !referrer) return 'Direct'
    
    // Handle long URLs
    try {
      const url = new URL(referrer)
      let hostname = url.hostname
      
      // Clean up common patterns
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4)
      }
      
      // Handle very long hostnames
      if (hostname.length > 25) {
        return hostname.substring(0, 22) + '...'
      }
      
      return hostname
    } catch {
      // If it's not a valid URL, truncate it
      if (referrer.length > 25) {
        return referrer.substring(0, 22) + '...'
      }
      return referrer
    }
  }

  const getReferrerTitle = (referrer: string) => {
    // Return full referrer for tooltip
    return referrer === 'Direct' || !referrer ? 'Direct traffic' : referrer
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Website Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Detailed visitor insights and traffic patterns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={cleanBoltNewData}
            disabled={isCleaningData}
            className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
          <Trash2
            className={`h-4 w-4 ${isCleaningData ? 'animate-spin' : ''}`}
          />
          <span>{isCleaningData ? 'Cleaning...' : 'Clean Dev Data'}</span>
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : analytics ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Total Visits</h4>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalVisits}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Unique Visitors</h4>
                  <p className="text-3xl font-bold text-green-600">{analytics.uniqueVisitors}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Avg. Daily Visits</h4>
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round(analytics.totalVisits / Math.max(analytics.dailyData.length, 1))}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Peak Hour</h4>
                  <p className="text-3xl font-bold text-orange-600">
                    {analytics.hourlyData.reduce((max, curr) => curr.visits > max.visits ? curr : max, analytics.hourlyData[0])?.hour || 0}:00
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Visits Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Daily Visits</h3>
              <div className="space-y-2">
                {analytics.dailyData.slice(-7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-20">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center space-x-2 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                             width: `${Math.max((day.visits / Math.max(...analytics.dailyData.map(d => d.visits))) * 100, 2)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{day.visits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Hourly Distribution (Today)</h3>
              <div className="grid grid-cols-6 gap-1">
                {analytics.hourlyData.map((hour) => (
                  <div key={hour.hour} className="text-center">
                    <div 
                      className="bg-blue-500 rounded-t mx-auto mb-1 transition-all duration-300"
                      style={{ 
                        height: `${Math.max((hour.visits / Math.max(...analytics.hourlyData.map(h => h.visits))) * 40, 2)}px`,
                        width: '16px'
                      }}
                      title={`${hour.hour}:00 - ${hour.visits} visits`}
                    />
                    <span className="text-xs text-gray-500">{hour.hour}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Top Pages</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {analytics.topPages.map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-500 flex-shrink-0">#{index + 1}</span>
                        <span className="text-gray-900 truncate">{formatPageName(page.page)}</span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                             style={{ 
                               width: `${(page.visits / analytics.topPages[0].visits) * 100}%`
                             }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{page.visits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Top Referrers</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {analytics.topReferrers.map((referrer, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-500 flex-shrink-0">#{index + 1}</span>
                        <span 
                          className="text-gray-900 truncate cursor-help" 
                          title={getReferrerTitle(referrer.referrer)}
                        >
                          {formatReferrer(referrer.referrer)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ 
                              width: `${(referrer.visits / analytics.topReferrers[0].visits) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{referrer.visits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Visits Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Recent Visits (Filtered)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {siteVisits
                    .filter(visit => {
                      const referrer = visit.referrer || ''
                      return !referrer.includes('bolt.new') && 
                             !referrer.includes('webcontainer') && 
                             !referrer.includes('local-credentialless')
                    })
                    .slice(0, 20)
                    .map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(visit.visited_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPageName(visit.page)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <span 
                          className="truncate block cursor-help" 
                          title={getReferrerTitle(visit.referrer)}
                        >
                          {formatReferrer(visit.referrer)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      )}
    </div>
  )
}

export default AnalyticsTab