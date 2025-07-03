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
    const { queryStringParameters } = event
    const bikeId = queryStringParameters?.bike_id

    if (!bikeId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'bike_id parameter is required' }),
      }
    }

    // Get all confirmed and pending bookings for this bike
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('start_date, end_date, status, id, customer_name')
      .eq('bike_id', bikeId)
      .in('status', ['pending', 'confirmed'])
      .order('start_date', { ascending: true })

    if (error) {
      throw error
    }

    // Generate array of all booked dates
    const bookedDates = []
    
    if (bookings && bookings.length > 0) {
      bookings.forEach((booking) => {
        // Parse the dates
        const startDate = new Date(booking.start_date)
        const endDate = new Date(booking.end_date)
        
        // Create date objects at midday to avoid timezone shifting
        const startMidday = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12, 0, 0)
        const endMidday = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 12, 0, 0)
        
        // Add all dates in the booking range (inclusive)
        const currentDate = new Date(startMidday)
        while (currentDate <= endMidday) {
          const dateToAdd = new Date(currentDate)
          bookedDates.push(dateToAdd)
          currentDate.setDate(currentDate.getDate() + 1)
        }
      })
    }

    // Convert to ISO strings for consistent handling
    const bookedDateStrings = bookedDates.map((date) => {
      return date.toISOString()
    })

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        success: true,
        bookedDates: bookedDateStrings,
        bikeId,
        count: bookedDateStrings.length
      }),
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch booked dates',
        details: error.message,
        bookedDates: []
      }),
    }
  }
}