import { createClient } from '@supabase/supabase-js'
import { AnalyticsTracker } from './analytics'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced site visit tracking using the new analytics system
export const trackSiteVisit = async () => {
  try {
    await AnalyticsTracker.trackPageView()
  } catch (error) {
    console.error('Error tracking site visit:', error)
  }
}

// Export analytics tracker for use in components
export { AnalyticsTracker }