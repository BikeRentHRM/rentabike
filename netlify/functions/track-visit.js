const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

exports.handler = async (event, context) => {
  console.log('📈 Visit tracking function called')
  
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
    const visitData = JSON.parse(event.body || '{}')
    
    console.log('📈 Tracking visit:', {
      page: visitData.page,
      referrer: visitData.referrer || 'Direct',
      userAgent: visitData.userAgent ? 'Present' : 'Missing'
    })

    // Extract useful information from headers
    const clientIP = event.headers['x-forwarded-for'] || 
                    event.headers['x-real-ip'] || 
                    context.clientContext?.ip || 
                    'unknown'
    
    const userAgent = visitData.userAgent || 
                     event.headers['user-agent'] || 
                     'unknown'

    // Prepare visit record
    const visitRecord = {
      visited_at: new Date().toISOString(),
      page: visitData.page || '/',
      referrer: visitData.referrer || null,
      user_agent: userAgent,
      // Additional tracking data
      ip_address: clientIP,
      country: event.headers['cf-ipcountry'] || null, // Cloudflare country header
      session_id: visitData.sessionId || null,
      utm_source: visitData.utmSource || null,
      utm_medium: visitData.utmMedium || null,
      utm_campaign: visitData.utmCampaign || null,
      screen_resolution: visitData.screenResolution || null,
      viewport_size: visitData.viewportSize || null,
      device_type: visitData.deviceType || null,
      browser: visitData.browser || null,
      os: visitData.os || null
    }

    // Insert visit record
    const { data, error } = await supabase
      .from('site_visits')
      .insert([visitRecord])
      .select()
      .single()

    if (error) {
      console.error('📈 Error inserting visit record:', error)
      throw error
    }

    console.log('📈 Visit tracked successfully:', data.id)

    // Return minimal response for performance
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        visitId: data.id,
        timestamp: data.visited_at
      }),
    }

  } catch (error) {
    console.error('📈 Error in visit tracking function:', error)
    
    // Don't fail the request if tracking fails
    return {
      statusCode: 200, // Return 200 to avoid client-side errors
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Tracking failed',
        details: error.message 
      }),
    }
  }
}