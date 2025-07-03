const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

exports.handler = async (event, context) => {
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
    console.log('Fetching available bikes for public display...')
    
    // Fetch only available bikes for public display
    const { data, error } = await supabase
      .from('bikes')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bikes:', error)
      throw error
    }

    console.log(`Successfully fetched ${data?.length || 0} available bikes`)

    // Add cache headers for better performance
    const cacheHeaders = {
      ...headers,
      'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      'ETag': `"bikes-${Date.now()}"`,
    }

    return {
      statusCode: 200,
      headers: cacheHeaders,
      body: JSON.stringify({
        bikes: data || [],
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      }),
    }
  } catch (error) {
    console.error('Error in get-bikes function:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch bikes',
        details: error.message,
        bikes: [], // Return empty array as fallback
        count: 0
      }),
    }
  }
}