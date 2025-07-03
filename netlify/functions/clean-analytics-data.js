const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

exports.handler = async (event, context) => {
  console.log('🧹 Clean analytics data function called')
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { action } = JSON.parse(event.body || '{}')
    
    console.log('🧹 Cleaning action:', action)

    if (action === 'clean_bolt_new') {
      // Delete all visits with bolt.new or development-related referrers
      const { data, error } = await supabase
        .from('site_visits')
        .delete()
        .or('referrer.ilike.%bolt.new%,referrer.ilike.%webcontainer%,referrer.ilike.%local-credentialless%')
        .select('id')

      if (error) {
        console.error('🧹 Error cleaning bolt.new data:', error)
        throw error
      }

      const deletedCount = data?.length || 0
      console.log(`🧹 Successfully deleted ${deletedCount} bolt.new tracking entries`)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          deletedCount,
          message: `Removed ${deletedCount} development tracking entries`
        }),
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' }),
    }

  } catch (error) {
    console.error('🧹 Error in clean analytics data function:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to clean analytics data',
        details: error.message 
      }),
    }
  }
}