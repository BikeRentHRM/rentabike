// functions/get-site-visits.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

exports.handler = async (event, context) => {
  console.log('📊 Analytics function called')
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { queryStringParameters } = event
    const timeRange = queryStringParameters?.range || 'week'
    
    console.log('📊 Fetching analytics for range:', timeRange)

    // Calculate date range
    const now = new Date()
    let startDate

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0) // All time
    }

    // Fetch site visits
    let query = supabase
      .from('site_visits')
      .select('*')
      .order('visited_at', { ascending: false })

    if (timeRange !== 'all') {
      query = query.gte('visited_at', startDate.toISOString())
    }

    const { data: siteVisits, error } = await query

    if (error) {
      console.error('📊 Error fetching site visits:', error)
      throw error
    }

    console.log(`📊 Fetched ${siteVisits?.length || 0} site visits`)

    // Process analytics data
    const totalVisits = siteVisits?.length || 0
    
    // Estimate unique visitors by user agent (rough approximation)
    const uniqueVisitors = siteVisits
      ? new Set(siteVisits.map(v => v.user_agent)).size
      : 0

    // Top pages
    const pageVisits = (siteVisits || []).reduce((acc, visit) => {
      acc[visit.page] = (acc[visit.page] || 0) + 1
      return acc
    }, {})

    const topPages = Object.entries(pageVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, visits]) => ({ page, visits }))

    // Top referrers
    const referrerVisits = (siteVisits || []).reduce((acc, visit) => {
      const referrer = visit.referrer || 'Direct'
      acc[referrer] = (acc[referrer] || 0) + 1
      return acc
    }, {})

    const topReferrers = Object.entries(referrerVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([referrer, visits]) => ({ referrer, visits }))

    // Hourly data (for today)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const visits = (siteVisits || []).filter(visit => {
        const visitDate = new Date(visit.visited_at)
        const visitHour = visitDate.getHours()
        const isToday = visitDate.toDateString() === now.toDateString()
        return isToday && visitHour === hour
      }).length
      return { hour, visits }
    })

    // Daily data
    const dailyData = []
    const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 30
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const visits = (siteVisits || []).filter(visit => {
        const visitDate = new Date(visit.visited_at)
        return visitDate >= dayStart && visitDate < dayEnd
      }).length
      
      dailyData.push({ date: dateStr, visits })
    }

    // **Return BOTH analytics and the raw visits array**
    const analyticsData = {
      totalVisits,
      uniqueVisitors,
      topPages,
      topReferrers,
      hourlyData,
      dailyData,
      timeRange,
      generatedAt: new Date().toISOString(),
      visits: siteVisits             // ← ← ← ADD THIS LINE
    }

    console.log('📊 Analytics processed successfully')

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify(analyticsData),
    }

  } catch (error) {
    console.error('📊 Error in analytics function:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch analytics',
        details: error.message 
      }),
    }
  }
}
