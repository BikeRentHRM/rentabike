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
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    const { httpMethod, queryStringParameters, body } = event
    const bookingId = queryStringParameters?.id

    console.log(`Booking management request: ${httpMethod}`, { bookingId, hasBody: !!body })

    switch (httpMethod) {
      case 'GET':
        // Get all bookings or specific booking
        if (bookingId) {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              bikes (
                id,
                name,
                type,
                image_url
              )
            `)
            .eq('id', bookingId)
            .single()
          
          if (error) {
            console.error('Error fetching booking:', error)
            throw error
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
          }
        } else {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              bikes (
                id,
                name,
                type,
                image_url
              )
            `)
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('Error fetching bookings:', error)
            throw error
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
          }
        }

      case 'PUT':
        // Update booking status
        if (!bookingId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Booking ID is required for updates' }),
          }
        }

        if (!body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Request body is required' }),
          }
        }

        const updateData = JSON.parse(body)
        
        // Validate status if provided
        if (updateData.status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(updateData.status)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid status value' }),
          }
        }

        // Get current booking for email notification
        const { data: currentBooking, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            *,
            bikes (
              id,
              name,
              type
            )
          `)
          .eq('id', bookingId)
          .single()

        if (fetchError || !currentBooking) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Booking not found' }),
          }
        }
        
        const { data: updatedBooking, error: updateError } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId)
          .select(`
            *,
            bikes (
              id,
              name,
              type
            )
          `)
          .single()

        if (updateError) {
          console.error('Error updating booking:', updateError)
          throw updateError
        }

        // Send status update email if status changed
        if (updateData.status && updateData.status !== currentBooking.status) {
          try {
            const emailResponse = await fetch(`${event.headers.origin || 'https://rent-bikes.ca'}/.netlify/functions/send-booking-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                booking: updatedBooking,
                bike: updatedBooking.bikes,
                type: 'status_update',
                previousStatus: currentBooking.status
              })
            })

            if (!emailResponse.ok) {
              console.error('Failed to send status update email')
            }
          } catch (emailError) {
            console.error('Error sending status update email:', emailError)
          }
        }

        console.log('Booking updated successfully:', bookingId)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedBooking),
        }

      case 'DELETE':
        // Cancel/Delete booking
        if (!bookingId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Booking ID is required for deletion' }),
          }
        }

        // First check if booking exists
        const { data: existingBooking, error: fetchDeleteError } = await supabase
          .from('bookings')
          .select(`
            id, 
            customer_name,
            status,
            bikes (
              name
            )
          `)
          .eq('id', bookingId)
          .single()

        if (fetchDeleteError || !existingBooking) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Booking not found' }),
          }
        }

        // Update status to cancelled instead of deleting
        const { error: cancelError } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId)

        if (cancelError) {
          console.error('Error cancelling booking:', cancelError)
          throw cancelError
        }

        console.log('Booking cancelled successfully:', bookingId)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: `Booking for ${existingBooking.customer_name} has been cancelled`,
            cancelledId: bookingId
          }),
        }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: `Method ${httpMethod} not allowed` }),
        }
    }
  } catch (error) {
    console.error('Error in manage-bookings function:', error)
    
    // Handle specific Supabase errors
    if (error.code === 'PGRST116') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          error: 'Resource not found',
          details: error.message 
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