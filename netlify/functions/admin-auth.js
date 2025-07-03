const jwt = require('jsonwebtoken')

const adminPassword = process.env.ADMIN_PASSWORD
const jwtSecret     = process.env.JWT_SECRET

exports.handler = async (event, context) => {
  // 🌟 Top‐level debug
  console.log('--- admin-auth invoked ---')
  console.log('HTTP Method:', event.httpMethod)
  console.log('ADMIN_PASSWORD set?', Boolean(adminPassword))
  console.log('JWT_SECRET set?', Boolean(jwtSecret))
  console.log('Raw headers:', event.headers)
  console.log('Raw body:', event.body)

  // Common CORS headers
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    console.log('→ OPTIONS preflight, returning 200')
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    console.log('→ Not a POST, returning 405')
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  let payload
  try {
    payload = JSON.parse(event.body)
    console.log('Parsed payload:', payload)
  } catch (err) {
    console.error('⚠️ Failed to parse JSON body:', err)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Bad JSON', message: err.message }),
    }
  }

  const { password, action } = payload
  console.log(`→ action=${action}, passwordProvided?`, typeof password === 'string')

  try {
    if (action === 'login') {
      console.log('🔐 Handling login request')

      if (!adminPassword) {
        console.error('❌ ADMIN_PASSWORD is missing')
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error:   'Admin password not configured',
            message: 'ADMIN_PASSWORD env var is not set'
          }),
        }
      }

      if (password !== adminPassword) {
        console.warn('🚫 Invalid password attempt')
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error:   'Invalid password',
            message: 'The provided password is incorrect'
          }),
        }
      }

      console.log('✅ Password validated; signing JWT')
      const token = jwt.sign(
        { admin: true, timestamp: Date.now() },
        jwtSecret,
        { expiresIn: '24h' }
      )

      console.log('→ Issued token successfully')
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          message: 'Authentication successful'
        }),
      }
    }

    if (action === 'verify') {
      console.log('🔍 Handling verify request')

      const { token } = payload
      if (!token) {
        console.warn('⚠️ No token provided for verify')
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'No token provided', valid: false }),
        }
      }

      try {
        const decoded = jwt.verify(token, jwtSecret)
        console.log('✅ Token valid:', decoded)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            valid: true,
            admin: decoded.admin,
            message: 'Token is valid'
          }),
        }
      } catch (jwtError) {
        console.error('❌ Token verify failed:', jwtError)
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid or expired token', valid: false }),
        }
      }
    }

    console.warn('⚠️ Unknown action:', action)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error:   'Invalid action',
        message: 'Action must be either "login" or "verify"'
      }),
    }
  } catch (error) {
    console.error('💥 Uncaught error in handler:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    }
  }
}
