export interface Bike {
  id: string
  name: string
  type: string
  description: string
  price_per_hour: number
  price_per_day: number
  image_url: string
  available: boolean
  features: string[]
  created_at: string
}

export interface Booking {
  id: string
  bike_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  duration_hours: number
  total_cost: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  special_requests?: string
  created_at: string
  bike?: Bike
}

export interface SiteVisit {
  id: string
  visited_at: string
  page: string
  referrer?: string
  user_agent: string
}