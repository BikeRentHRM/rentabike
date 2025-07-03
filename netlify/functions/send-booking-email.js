const { createClient } = require('@supabase/supabase-js')
const nodemailer = require('nodemailer')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Gmail configuration with better error handling
const gmailConfig = {
  service: 'gmail',
  auth: {
    user: 'rentabikehrm@gmail.com',
    pass: 'bjcm wavd vjqz vdde' // App password
  },
  // Add these for better reliability
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
}

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
    const { booking, bike, type, previousStatus } = JSON.parse(event.body)

    // Validate required data
    if (!booking || !bike) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing booking or bike data' }),
      }
    }

    if (!booking.customer_email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing customer email' }),
      }
    }

    // Create transporter with better error handling
    const transporter = nodemailer.createTransport(gmailConfig)

    // Verify transporter configuration
    try {
      await transporter.verify()
    } catch (verifyError) {
      throw new Error(`Email configuration error: ${verifyError.message}`)
    }

    // Get the admin dashboard URL from the request origin
    const origin = event.headers.origin ||
                  event.headers.host ? `https://${event.headers.host}` :
                  'https://classy-semolina-42a7a1.netlify.app'

    const adminDashboardUrl = `${origin}/admin`

    // Format dates for display in Halifax timezone
    const startDate = new Date(booking.start_date).toLocaleString('en-CA', {
      timeZone: 'America/Halifax',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const endDate = new Date(booking.end_date).toLocaleString('en-CA', {
      timeZone: 'America/Halifax',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const days = Math.ceil(booking.duration_hours / 24)

    if (type === 'confirmation') {
      // Customer confirmation email with payment instructions
      const customerEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚴‍♂️ Rent A Bike</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Halifax's Most Affordable Daily Bike Rentals</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Booking Confirmation - Payment Required</h2>
            <p style="color: #4b5563; font-size: 16px;">Hi ${booking.customer_name},</p>
            <p style="color: #4b5563; font-size: 16px;">Thank you for choosing Rent A Bike! Your booking request has been received and is being held for 3 hours pending payment.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">⏰ URGENT: Payment Required Within 3 Hours</h3>
              <p style="margin: 5px 0; color: #92400e; font-weight: bold;">Your booking will be automatically cancelled if payment is not received within 3 hours.</p>
            </div>

            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">💳 E-Transfer Payment Instructions</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> rentabikehrm@gmail.com</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Amount:</strong> $${booking.total_cost}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Message:</strong> Booking ID: ${booking.id}</p>
              </div>
              <p style="color: #1e40af; font-size: 14px; margin-top: 10px;">Please include your booking ID in the e-transfer message for faster processing.</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">📋 Booking Details</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Booking ID:</strong> ${booking.id}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Bike:</strong> ${bike.name} (${bike.type})</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Start:</strong> ${startDate}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>End:</strong> ${endDate}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Pick-up Time:</strong> ${booking.pickup_time}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Drop-off Time:</strong> ${booking.dropoff_time}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Duration:</strong> ${days} day(s)</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Total Cost:</strong> $${booking.total_cost}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px;">PENDING PAYMENT</span></p>
              ${booking.special_requests ? `<p style="margin: 5px 0; color: #374151;"><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #166534; margin-top: 0;">✅ After Payment is Received</h3>
              <p style="color: #374151; margin: 5px 0;">✅ We'll confirm your booking within 1 hour</p>
              <p style="color: #374151; margin: 5px 0;">✅ You'll receive pickup instructions via email</p>
              <p style="color: #374151; margin: 5px 0;">✅ Bring valid ID for bike pickup</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">📍 Pickup Location</h3>
              <p style="color: #374151; margin: 5px 0;"><strong>Address:</strong> 4 Leaman Dr, Dartmouth, NS B3A 2K5</p>
              <p style="color: #374151; margin: 5px 0;">Free parking available on-site</p>
              <p style="color: #374151; margin: 5px 0; font-size: 14px;">📍 <a href="https://maps.google.com/?q=4+Leaman+Dr,+Dartmouth,+NS+B3A+2K5" style="color: #3b82f6;">View on Google Maps</a></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4b5563; font-size: 16px;">Questions? Contact us:</p>
              <p style="color: #3b82f6; font-weight: bold; margin: 5px 0;">📞 (902) 414-5894</p>
              <p style="color: #3b82f6; font-weight: bold; margin: 5px 0;">✉️ rentabikehrm@gmail.com</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
              <p style="color: #92400e; margin: 0; font-weight: bold;">🏆 You chose Halifax's cheapest daily bike rental service!</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>© 2025 Rent A Bike - Halifax Regional Municipality's Most Affordable Daily Bike Rentals</p>
          </div>
        </div>
      `

      // Admin notification email with dashboard link
      const adminEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">🚨 New Bike Booking - Payment Pending</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="color: #374151; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone}</p>
            
            <h3 style="color: #374151;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Bike:</strong> ${bike.name} (${bike.type})</p>
            <p><strong>Start:</strong> ${startDate}</p>
            <p><strong>End:</strong> ${endDate}</p>
            <p><strong>Pick-up Time:</strong> ${booking.pickup_time}</p>
            <p><strong>Drop-off Time:</strong> ${booking.dropoff_time}</p>
            <p><strong>Duration:</strong> ${days} day(s)</p>
            <p><strong>Total Cost:</strong> $${booking.total_cost}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            ${booking.special_requests ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px;">
              <p style="color: #92400e; margin: 0; font-weight: bold;">⏰ Booking will be held for 3 hours pending e-transfer payment</p>
              <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">Customer has been instructed to send e-transfer to rentabikehrm@gmail.com</p>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #fef2f2; border-radius: 6px;">
              <p style="color: #dc2626; margin: 0; font-weight: bold;">⚡ Action Required: Monitor for e-transfer and confirm booking once received</p>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <a href="${adminDashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                🔧 Manage Booking in Admin Dashboard
              </a>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Click to access the admin dashboard and manage this booking</p>
            </div>
          </div>
        </div>
      `

      // Send customer confirmation email
      const customerMailOptions = {
        from: {
          name: 'Rent A Bike',
          address: 'rentabikehrm@gmail.com'
        },
        to: booking.customer_email,
        subject: `PAYMENT REQUIRED - Booking ${booking.id} | Rent A Bike`,
        html: customerEmailBody
      }

      // Send admin notification email
      const adminMailOptions = {
        from: {
          name: 'Rent A Bike Booking System',
          address: 'rentabikehrm@gmail.com'
        },
        to: 'rentabikehrm@gmail.com',
        subject: `New Booking (Payment Pending): ${booking.customer_name} - ${bike.name}`,
        html: adminEmailBody
      }

      // Send both emails with proper error handling
      try {
        await transporter.sendMail(customerMailOptions)
      } catch (customerEmailError) {
        throw new Error(`Failed to send customer confirmation email: ${customerEmailError.message}`)
      }

      try {
        await transporter.sendMail(adminMailOptions)
      } catch (adminEmailError) {
        // Don't throw here - customer email is more important
      }

    } else if (type === 'status_update') {
      // Status update email to customer
      const statusColors = {
        confirmed: { bg: '#f0fdf4', color: '#166534', text: 'CONFIRMED' },
        cancelled: { bg: '#fef2f2', color: '#dc2626', text: 'CANCELLED' },
        completed: { bg: '#eff6ff', color: '#1d4ed8', text: 'COMPLETED' }
      }

      const statusInfo = statusColors[booking.status] || { bg: '#f9fafb', color: '#374151', text: booking.status.toUpperCase() }

      const statusUpdateEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #3b82f6, #10b981); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚴‍♂️ Rent A Bike</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Booking Status Update</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Booking Status Update</h2>
            <p style="color: #4b5563; font-size: 16px;">Hi ${booking.customer_name},</p>
            <p style="color: #4b5563; font-size: 16px;">Your booking status has been updated.</p>
            
            <div style="background: ${statusInfo.bg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color};">
              <h3 style="color: ${statusInfo.color}; margin-top: 0;">Status Update</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Booking ID:</strong> ${booking.id}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Previous Status:</strong> ${previousStatus}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>New Status:</strong> <span style="background: ${statusInfo.color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">${statusInfo.text}</span></p>
            </div>
            
            ${booking.status === 'confirmed' ? `
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #166534; margin-top: 0;">🎉 Your Booking is Confirmed!</h3>
              <p style="color: #374151; margin: 5px 0;">✅ Payment received and processed</p>
              <p style="color: #374151; margin: 5px 0;">✅ Your bike is reserved for pickup</p>
              <p style="color: #374151; margin: 5px 0;">✅ Bring valid ID for bike pickup</p>
              
              <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="color: #166534; margin-top: 0;">📍 Pickup Instructions:</h4>
                <p style="margin: 5px 0; color: #374151;"><strong>Address:</strong> 4 Leaman Dr, Dartmouth, NS B3A 2K5</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Contact:</strong> (902) 414-5894</p>
                <p style="margin: 5px 0; color: #374151;">📍 <a href="https://maps.google.com/?q=4+Leaman+Dr,+Dartmouth,+NS+B3A+2K5" style="color: #3b82f6;">View on Google Maps</a></p>
              </div>
            </div>
            ` : booking.status === 'cancelled' ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin-top: 0;">❌ Booking Cancelled</h3>
              <p style="color: #374151; margin: 5px 0;">Your booking has been cancelled. This could be due to:</p>
              <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
                <li>Payment not received within 3 hours</li>
                <li>Bike unavailability</li>
                <li>Customer request</li>
              </ul>
              <p style="color: #374151; margin: 5px 0;">If you have any questions, please contact us at (902) 414-5894</p>
            </div>
            ` : booking.status === 'completed' ? `
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1d4ed8;">
              <h3 style="color: #1d4ed8; margin-top: 0;">🏁 Rental Completed</h3>
              <p style="color: #374151; margin: 5px 0;">Thank you for choosing Rent A Bike! We hope you enjoyed your ride.</p>
              <p style="color: #374151; margin: 5px 0;">⭐ We'd love to hear about your experience!</p>
              <p style="color: #374151; margin: 5px 0;">📧 Email us at rentabikehrm@gmail.com with your feedback</p>
            </div>
            ` : ''}
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Booking Details</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Bike:</strong> ${bike.name} (${bike.type})</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Start:</strong> ${startDate}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>End:</strong> ${endDate}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Pick-up Time:</strong> ${booking.pickup_time}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Drop-off Time:</strong> ${booking.dropoff_time}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Duration:</strong> ${days} day(s)</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Total Cost:</strong> $${booking.total_cost}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4b5563; font-size: 16px;">Questions? Contact us:</p>
              <p style="color: #3b82f6; font-weight: bold; margin: 5px 0;">📞 (902) 414-5894</p>
              <p style="color: #3b82f6; font-weight: bold; margin: 5px 0;">✉️ rentabikehrm@gmail.com</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>© 2025 Rent A Bike - Halifax Regional Municipality's Most Affordable Daily Bike Rentals</p>
          </div>
        </div>
      `

      // Admin notification for status updates with dashboard link
      const adminStatusEmailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">📋 Booking Status Updated</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="color: #374151; margin-top: 0;">Status Change Summary</h3>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Customer:</strong> ${booking.customer_name} (${booking.customer_email})</p>
            <p><strong>Bike:</strong> ${bike.name} (${bike.type})</p>
            <p><strong>Previous Status:</strong> ${previousStatus}</p>
            <p><strong>New Status:</strong> <span style="background: ${statusInfo.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${statusInfo.text}</span></p>
            <p><strong>Updated:</strong> ${new Date().toLocaleString('en-CA', { timeZone: 'America/Halifax' })}</p>
            
            ${booking.status === 'confirmed' ? `
            <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border-radius: 6px;">
              <p style="color: #166534; margin: 0; font-weight: bold;">✅ Booking confirmed - customer notified with pickup instructions</p>
            </div>
            ` : booking.status === 'cancelled' ? `
            <div style="margin-top: 15px; padding: 15px; background: #fef2f2; border-radius: 6px;">
              <p style="color: #dc2626; margin: 0; font-weight: bold;">❌ Booking cancelled - customer notified</p>
            </div>
            ` : booking.status === 'completed' ? `
            <div style="margin-top: 15px; padding: 15px; background: #eff6ff; border-radius: 6px;">
              <p style="color: #1d4ed8; margin: 0; font-weight: bold;">🏁 Rental completed - customer thanked</p>
            </div>
            ` : ''}

            <div style="margin-top: 20px; text-align: center;">
              <a href="${adminDashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                🔧 View in Admin Dashboard
              </a>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Access the admin dashboard to manage all bookings</p>
            </div>
          </div>
        </div>
      `

      const statusUpdateMailOptions = {
        from: {
          name: 'Rent A Bike',
          address: 'rentabikehrm@gmail.com'
        },
        to: booking.customer_email,
        subject: `Booking ${statusInfo.text} - ${bike.name} | Rent A Bike`,
        html: statusUpdateEmailBody
      }

      const adminStatusMailOptions = {
        from: {
          name: 'Rent A Bike Admin System',
          address: 'rentabikehrm@gmail.com'
        },
        to: 'rentabikehrm@gmail.com',
        subject: `Booking Status Updated: ${booking.customer_name} - ${statusInfo.text}`,
        html: adminStatusEmailBody
      }

      try {
        await transporter.sendMail(statusUpdateMailOptions)
      } catch (statusEmailError) {
        throw new Error(`Failed to send customer status update email: ${statusEmailError.message}`)
      }

      try {
        await transporter.sendMail(adminStatusMailOptions)
      } catch (adminStatusEmailError) {
        // Don't throw here - customer email is more important
      }
    }

    // Close transporter
    transporter.close()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Emails sent successfully'
      }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send emails',
        details: error.message
      }),
    }
  }
}
