import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
import BookingModal from '../components/BookingModal'
import HeroSection from '../components/home/HeroSection'
import PriceBanner from '../components/home/PriceBanner'
import WhyChooseUs from '../components/home/WhyChooseUs'
import TrailsSection from '../components/home/TrailsSection'
import BikesSection from '../components/home/BikesSection'
import ContactSection from '../components/home/ContactSection'
import { trackSiteVisit } from '../lib/supabase'
import { Bike } from '../types'

const Home: React.FC = () => {
  const [bikes, setBikes] = useState<Bike[]>([])
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBikes()
    trackSiteVisit()
  }, [])

  const fetchBikes = async () => {
    try {
      // Use dedicated public bikes serverless function
      const response = await fetch('/.netlify/functions/get-bikes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBikes(data.bikes || [])
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      // Final fallback to demo data
      setBikes([
        {
          id: '1',
          name: 'Urban Explorer',
          type: 'City Bike',
          description: 'Perfect for exploring Halifax waterfront and city streets.',
          price_per_hour: 0,
          price_per_day: 20,
          image_url: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg',
          available: true,
          features: ['Basket', 'LED Lights', 'Comfortable Seat', '7 Gears'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Mountain Trail',
          type: 'Mountain Bike',
          description: 'Tackle Halifax\'s trails and hills with confidence.',
          price_per_hour: 0,
          price_per_day: 25,
          image_url: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg',
          available: true,
          features: ['Suspension', 'All Terrain Tires', '21 Gears', 'Water Bottle Holder'],
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleBookBike = (bike: Bike) => {
    setSelectedBike(bike)
    setIsBookingModalOpen(true)
  }

  const handleBookingSubmit = async (bookingData: any) => {
    const response = await fetch('/.netlify/functions/create-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create booking')
    }
    
    // Return success - the modal will handle the confirmation display
    return result
  }

  const handleCloseModal = () => {
    setIsBookingModalOpen(false)
    setSelectedBike(null)
  }

  return (
    <Layout>
      <SEO 
        title="Rent A Bike - Cheapest Daily Bike Rentals in Halifax Regional Municipality"
        description="HRM's cheapest daily bike rentals starting from $20/day! Explore Halifax, Dartmouth, and surrounding areas with our affordable, quality bikes."
        keywords="cheap daily bike rental halifax, affordable bicycle rental dartmouth, budget bike rental HRM, cheapest cycling halifax, discount bike tours nova scotia"
      />
      
      <HeroSection />
      <PriceBanner />
      <WhyChooseUs />
      <TrailsSection />
      <BikesSection bikes={bikes} loading={loading} onBookBike={handleBookBike} />
      <ContactSection />

      <BookingModal
        bike={selectedBike}
        isOpen={isBookingModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleBookingSubmit}
      />
    </Layout>
  )
}

export default Home