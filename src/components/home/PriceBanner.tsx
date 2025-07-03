import React from 'react'
import { Award, DollarSign, Shield, Clock } from 'lucide-react'

const PriceBanner: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-600 to-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white">
          {/* Best Prices */}
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <DollarSign className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Best Prices</h3>
              <p className="text-sm text-blue-100">Starting from $20/day</p>
            </div>
          </div>

          {/* Quality Guarantee */}
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Shield className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-blue-100">Premium maintained bikes</p>
            </div>
          </div>

          {/* Quick Service */}
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Clock className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Quick Service</h3>
              <p className="text-sm text-blue-100">Ready in 5 minutes</p>
            </div>
          </div>

          {/* Award */}
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <Award className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Top Rated</h3>
              <p className="text-sm text-blue-100">4.9/5 customer rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PriceBanner