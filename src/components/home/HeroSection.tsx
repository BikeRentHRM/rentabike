import React, { useState, useEffect } from 'react'
import { Bike, ArrowRight, MapPin, Star, Clock, Shield } from 'lucide-react'

const HeroSection: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0)
  
  const features = [
    { icon: Star, text: "Best Value in HRM" },
    { icon: Clock, text: "Quick & Easy Booking" },
    { icon: Shield, text: "Reliable & Safe Bikes" },
    { icon: MapPin, text: "Trails Across HRM" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage:
            "url('https://novascotia.com/wp-content/uploads/2024/11/keppoch-mountain-1920x1080-67292d7ea8f05.webp')",
        }}
      />
      
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
      
      {/* Animated elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center bg-gradient-to-r from-blue-600/90 to-green-600/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
          <MapPin className="mr-2 h-4 w-4" />
          Dartmouth's Most Affordable Bike Rentals
        </div>

        {/* Main heading with enhanced typography */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
          <span className="text-white">Explore HRM on</span>{' '}
          <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-none">
            Two Wheels
          </span>
        </h1>

        {/* Enhanced description */}
        <p className="text-xl sm:text-2xl mb-4 text-white max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          Affordable bike rentals starting at just{' '}
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-none">$10/day</span>
        </p>
        
        <p className="text-lg sm:text-xl mb-8 text-gray-100 max-w-2xl mx-auto drop-shadow-lg">
          Discover the beauty of Halifax Regional Municipality's trails without breaking the bank. Quality bikes at unbeatable prices!
        </p>

        {/* Rotating features */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-500 border border-white/20">
            {React.createElement(features[currentFeature].icon, {
              className: "mr-3 h-5 w-5 text-blue-400"
            })}
            <span className="text-lg font-medium text-white drop-shadow-sm">{features[currentFeature].text}</span>
          </div>
        </div>

        {/* Enhanced call-to-action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => scrollToSection('bikes')}
            className="group inline-flex items-center bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Bike className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
            Browse Bikes
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => scrollToSection('trails')}
            className="group inline-flex items-center border-2 border-white/80 hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-none transform hover:scale-105"
          >
            <MapPin className="mr-3 h-6 w-6 group-hover:bounce" />
            Explore Trails
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm">
          <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Star className="mr-2 h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-white font-medium">Best Value</span>
          </div>
          <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Shield className="mr-2 h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">Quality Guaranteed</span>
          </div>
          <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Clock className="mr-2 h-4 w-4 text-green-400" />
            <span className="text-white font-medium">Quick Booking</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="flex flex-col items-center">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
          <span className="text-xs mt-2">Scroll</span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection