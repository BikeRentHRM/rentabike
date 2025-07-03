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
    const bookingData = JSON.parse(event.body)

    // Validate required fields
    const requiredFields = [
      'bike_id', 'customer_name', 'customer_email', 'customer_phone',
      'start_date', 'end_date', 'duration_hours', 'total_cost'
    ]
    
    const missingFields = requiredFields.filter(field => !bookingData[field])
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields', 
          missingFields 
        }),
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(bookingData.customer_email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid email format' 
        }),
      }
    }

    // Validate dates
    const startDate = new Date(bookingData.start_date)
    const endDate = new Date(bookingData.end_date)
    const now = new Date()

    if (startDate < now.setHours(0, 0, 0, 0)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Start date cannot be in the past' 
        }),
      }
    }

    // Allow same day rentals - end date can be same as start date
    if (endDate < startDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'End date cannot be before start date' 
        }),
      }
    }

    // Check if bike exists and is available
    const { data: bike, error: bikeError } = await supabase
      .from('bikes')
      .select('id, name, type, available')
      .eq('id', bookingData.bike_id)
      .single()

    if (bikeError || !bike) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Bike not found' 
        }),
      }
    }

    if (!bike.available) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bike is not available for booking' 
        }),
      }
    }

    // Check for conflicting bookings with proper date overlap logic
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, status')
      .eq('bike_id', bookingData.bike_id)
      .in('status', ['pending', 'confirmed'])

    if (conflictError) {
      throw conflictError
    }

    // Check each existing booking for date overlap
    const hasConflict = conflictingBookings?.some(existingBooking => {
      const existingStart = new Date(existingBooking.start_date)
      const existingEnd = new Date(existingBooking.end_date)
      const newStart = new Date(bookingData.start_date)
      const newEnd = new Date(bookingData.end_date)

      // Check if dates overlap
      // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
      const overlaps = newStart <= existingEnd && existingStart <= newEnd

      return overlaps
    })

    if (hasConflict) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'Bike is already booked for the selected dates. Please choose different dates or another bike.' 
        }),
      }
    }

    // Create the booking
    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert([{
        bike_id: bookingData.bike_id,
        customer_name: bookingData.customer_name.trim(),
        customer_email: bookingData.customer_email.toLowerCase().trim(),
        customer_phone: bookingData.customer_phone.trim(),
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        duration_hours: bookingData.duration_hours,
        total_cost: parseFloat(bookingData.total_cost),
        status: 'pending',
        special_requests: bookingData.special_requests?.trim() || null
      }])
      .select(`
        *,
        bikes (
          id,
          name,
          type,
          price_per_day
        )
      `)
      .single()

    if (createError) {
      throw createError
    }

    // Send confirmation emails
    try {
      // Get the current domain for the email function call
      const origin = event.headers.origin || 
                    event.headers.host ? `https://${event.headers.host}` : 
                    'https://rent-bikes.ca'
      
      const emailResponse = await fetch(`${origin}/.netlify/functions/send-booking-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: newBooking,
          bike: newBooking.bikes,
          type: 'confirmation'
        })
      })

      const emailResult = await emailResponse.text()

      if (!emailResponse.ok) {
        // Don't fail the booking if email fails, but log it
      }
    } catch (emailError) {
      // Don't fail the booking if email fails
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        booking: newBooking,
        message: 'Booking created successfully! You will receive a confirmation email shortly.'
      }),
    }

  } catch (error) {
    // Handle specific database errors
    if (error.code === '23505') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'Booking conflict',
          details: 'A booking already exists for this time period' 
        }),
      }
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    }
  }
}