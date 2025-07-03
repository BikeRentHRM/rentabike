// Enhanced analytics tracking utilities
export interface VisitData {
  page: string
  referrer?: string
  userAgent?: string
  sessionId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  screenResolution?: string
  viewportSize?: string
  deviceType?: string
  browser?: string
  os?: string
}

export class AnalyticsTracker {
  private static sessionId: string | null = null
  private static hasTrackedPageView = false

  // Generate or get session ID
  private static getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = sessionStorage.getItem('analytics_session_id')
      if (!this.sessionId) {
        this.sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
        sessionStorage.setItem('analytics_session_id', this.sessionId)
      }
    }
    return this.sessionId
  }

  // Detect device type
  private static getDeviceType(): string {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  // Detect browser
  private static getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  // Detect OS
  private static getOS(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Other'
  }

  // Extract UTM parameters
  private static getUTMParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined
    }
  }

  // Check if referrer should be tracked
  private static shouldTrackReferrer(referrer: string): boolean {
    if (!referrer) return true
    
    // Skip tracking for bolt.new and related domains
    const skipDomains = [
      'bolt.new',
      'stackblitz.com',
      'webcontainer',
      'local-credentialless'
    ]
    
    return !skipDomains.some(domain => referrer.includes(domain))
  }

  // Track page visit
  static async trackPageView(page?: string): Promise<void> {
    // Avoid duplicate tracking on the same page
    if (this.hasTrackedPageView && page === window.location.pathname) {
      return
    }

    // Skip tracking if referrer is from bolt.new or development environments
    const referrer = document.referrer
    if (!this.shouldTrackReferrer(referrer)) {
      return
    }

    try {
      const visitData: VisitData = {
        page: page || window.location.pathname,
        referrer: referrer || undefined,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
        ...this.getUTMParams()
      }

      // Try serverless function first
      try {
        const response = await fetch('/.netlify/functions/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visitData)
        })

        const result = await response.json()
        
        if (result.success) {
          this.hasTrackedPageView = true
          return
        }
      } catch (serverlessError) {
        // Silently fail
      }

      // Fallback to direct Supabase call
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        const { data, error } = await supabase
          .from('site_visits')
          .insert([{
            visited_at: new Date().toISOString(),
            page: visitData.page,
            referrer: visitData.referrer,
            user_agent: visitData.userAgent
          }])
          .select()
          .single()

        if (!error) {
          this.hasTrackedPageView = true
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Track custom events
  static async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    try {
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          page: window.location.pathname,
          sessionId: this.getSessionId(),
          timestamp: new Date().toISOString()
        }
      }

      // For now, just log events - could be extended to store in database
    } catch (error) {
      // Silently fail
    }
  }

  // Track booking attempts
  static trackBookingAttempt(bikeId: string, bikeName: string): void {
    this.trackEvent('booking_attempt', {
      bike_id: bikeId,
      bike_name: bikeName
    })
  }

  // Track booking completions
  static trackBookingComplete(bookingId: string, bikeId: string, totalCost: number): void {
    this.trackEvent('booking_complete', {
      booking_id: bookingId,
      bike_id: bikeId,
      total_cost: totalCost
    })
  }

  // Track page interactions
  static trackInteraction(element: string, action: string): void {
    this.trackEvent('page_interaction', {
      element,
      action
    })
  }
}

// Auto-track page views on route changes
export const trackSiteVisit = () => {
  AnalyticsTracker.trackPageView()
}

// Export for backward compatibility
export { AnalyticsTracker as default }