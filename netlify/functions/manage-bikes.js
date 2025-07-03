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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const bikeId = queryStringParameters?.id

    console.log(`Bike management request: ${httpMethod}`, { bikeId, hasBody: !!body })

    switch (httpMethod) {
      case 'GET':
        // Get all bikes or specific bike
        if (bikeId) {
          const { data, error } = await supabase
            .from('bikes')
            .select('*')
            .eq('id', bikeId)
            .single()
          
          if (error) {
            console.error('Error fetching bike:', error)
            throw error
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
          }
        } else {
          const { data, error } = await supabase
            .from('bikes')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('Error fetching bikes:', error)
            throw error
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data),
          }
        }

      case 'POST':
        // Create new bike
        if (!body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Request body is required' }),
          }
        }

        const newBikeData = JSON.parse(body)
        
        // Validate required fields
        const requiredFields = ['name', 'type', 'description', 'price_per_day', 'image_url']
        const missingFields = requiredFields.filter(field => !newBikeData[field])
        
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
        
        const { data: newBike, error: createError } = await supabase
          .from('bikes')
          .insert([{
            name: newBikeData.name,
            type: newBikeData.type,
            description: newBikeData.description,
            price_per_hour: newBikeData.price_per_hour || 0,
            price_per_day: newBikeData.price_per_day,
            image_url: newBikeData.image_url,
            available: newBikeData.available !== undefined ? newBikeData.available : true,
            features: newBikeData.features || []
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating bike:', createError)
          throw createError
        }

        console.log('Bike created successfully:', newBike.id)
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newBike),
        }

      case 'PUT':
        // Update existing bike
        if (!bikeId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Bike ID is required for updates' }),
          }
        }

        if (!body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Request body is required' }),
          }
        }

        const updateBikeData = JSON.parse(body)
        
        // Remove undefined values to avoid overwriting with null
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateBikeData).filter(([_, value]) => value !== undefined)
        )
        
        const { data: updatedBike, error: updateError } = await supabase
          .from('bikes')
          .update(cleanUpdateData)
          .eq('id', bikeId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating bike:', updateError)
          throw updateError
        }

        console.log('Bike updated successfully:', bikeId)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedBike),
        }

      case 'DELETE':
        // Delete bike
        if (!bikeId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Bike ID is required for deletion' }),
          }
        }

        // First check if bike exists
        const { data: existingBike, error: fetchError } = await supabase
          .from('bikes')
          .select('id, name')
          .eq('id', bikeId)
          .single()

        if (fetchError || !existingBike) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Bike not found' }),
          }
        }

        const { error: deleteError } = await supabase
          .from('bikes')
          .delete()
          .eq('id', bikeId)

        if (deleteError) {
          console.error('Error deleting bike:', deleteError)
          throw deleteError
        }

        console.log('Bike deleted successfully:', bikeId)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: `Bike "${existingBike.name}" deleted successfully`,
            deletedId: bikeId
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
    console.error('Error in manage-bikes function:', error)
    
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
    
    if (error.code === '23505') {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'Duplicate entry',
          details: 'A bike with this information already exists' 
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