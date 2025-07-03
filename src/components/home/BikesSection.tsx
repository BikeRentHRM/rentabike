import React from 'react'
import BikeCard from '../BikeCard'
import { Bike } from '../../types'
import { BikeIcon, Award } from 'lucide-react'

interface BikesSectionProps {
  bikes: Bike[]
  loading: boolean
  onBookBike: (bike: Bike) => void
}

const BikesSection: React.FC<BikesSectionProps> = ({ bikes, loading, onBookBike }) => {
  return (
    <section id="bikes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <BikeIcon className="h-4 w-4 mr-2" />
            Premium Fleet
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Ride
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From city cruisers to mountain bikes, we have the perfect bike for every adventure in Halifax Regional Municipality
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-green-500" />
              <span>All bikes safety certified</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Free helmet included</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>24/7 roadside support</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading our premium fleet...</p>
            </div>
          </div>
        ) : bikes.length === 0 ? (
          <div className="text-center py-20">
            <BikeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes available</h3>
            <p className="text-gray-600">Please check back later or contact us directly.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bikes.map((bike) => (
                <BikeCard key={bike.id} bike={bike} onBook={onBookBike} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Can't Find What You're Looking For?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contact us directly and we'll help you find the perfect bike for your Halifax adventure
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="tel:+1-902-414-5894"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Call (902) 414-5894
                  </a>
                  <a 
                    href="mailto:rentabikehrm@gmail.com"
                    className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default BikesSection