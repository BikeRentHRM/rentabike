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

    // Validate required fields (including pickup_time & dropoff_time)
    const requiredFields = [
      'bike_id',
      'customer_name',
      'customer_email',
      'customer_phone',
      'start_date',
      'end_date',
      'duration_hours',
      'total_cost',
      'pickup_time',
      'dropoff_time'
    ]
    const missingFields = requiredFields.filter(field => !(field in bookingData) || bookingData[field] === '')

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

    // Validate date logic
    const startDate = new Date(bookingData.start_date)
    const endDate = new Date(bookingData.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Start date cannot be in the past'
        }),
      }
    }

    if (endDate < startDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'End date cannot be before start date'
        }),
      }
    }

    // Optional: Validate time strings are in HH:MM format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(bookingData.pickup_time) || !timeRegex.test(bookingData.dropoff_time)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid time format. Use "HH:MM".'
        }),
      }
    }

    // Fetch bike and check availability
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

    // Check for conflicting bookings
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, status, pickup_time, dropoff_time')
      .eq('bike_id', bookingData.bike_id)
      .in('status', ['pending', 'confirmed'])

    if (conflictError) {
      throw conflictError
    }

    const newStart = new Date(bookingData.start_date + 'T' + bookingData.pickup_time + ':00Z')
    const newEnd = new Date(bookingData.end_date + 'T' + bookingData.dropoff_time + ':00Z')

    const hasConflict = conflictingBookings.some(existing => {
      const existingStart = new Date(existing.start_date + 'T' + (existing.pickup_time || '00:00') + ':00Z')
      const existingEnd = new Date(existing.end_date + 'T' + (existing.dropoff_time || '23:59') + ':00Z')
      return newStart <= existingEnd && existingStart <= newEnd
    })

    if (hasConflict) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Bike is already booked for the selected dates and times. Please choose different slots.'
        }),
      }
    }

    // Insert new booking including pickup_time & dropoff_time
    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert([{
        bike_id: bookingData.bike_id,
        customer_name: bookingData.customer_name.trim(),
        customer_email: bookingData.customer_email.toLowerCase().trim(),
        customer_phone: bookingData.customer_phone.trim(),
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        pickup_time: bookingData.pickup_time,
        dropoff_time: bookingData.dropoff_time,
        duration_hours: bookingData.duration_hours,
        total_cost: parseFloat(bookingData.total_cost),
        special_requests: bookingData.special_requests?.trim() || null,
        status: 'pending'
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

    // Optionally send confirmation email without blocking response
    try {
      const origin = event.headers.origin || `https://${event.headers.host}`
      await fetch(`${origin}/.netlify/functions/send-booking-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: newBooking,
          bike: newBooking.bikes,
          type: 'confirmation'
        })
      })
    } catch (e) {
      // email failure should not abort booking
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        booking: newBooking,
        message: 'Booking created successfully! Confirmation email will follow shortly.'
      }),
    }

  } catch (error) {
    if (error.code === '23505') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Booking conflict',
          details: 'A booking already exists for this period.'
        }),
      }
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message || error.toString()
      }),
    }
  }
}
