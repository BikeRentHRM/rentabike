// netlify/functions/get-site-visits.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl        = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

exports.handler = async (event) => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // parse range (today | week | month | all)
    const range = event.queryStringParameters?.range || 'week'
    const now   = new Date()
    let startDate

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24*60*60*1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24*60*60*1000)
        break
      default:
        startDate = null
    }

    // build query
    let query = supabase
      .from('site_visits')
      .select('*')
      .order('visited_at', { ascending: false })

    if (startDate) {
      query = query.gte('visited_at', startDate.toISOString())
    }

    const { data: visits, error } = await query

    if (error) throw error

    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify({ visits })
    }

  } catch (err) {
    console.error('Error in get-site-visits:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    }
  }
}
