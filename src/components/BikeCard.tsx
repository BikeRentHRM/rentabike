import React from 'react'
import { Star, Users, Zap, Check } from 'lucide-react'
import { Bike } from '../types'

interface BikeCardProps {
  bike: Bike
  onBook: (bike: Bike) => void
}

const BikeCard: React.FC<BikeCardProps> = ({ bike, onBook }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={bike.image_url} 
          alt={bike.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {bike.available ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              Available
            </span>
          ) : (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Unavailable
            </span>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          ${bike.price_per_day}/day
        </div>

        {/* Bike Type */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
          {bike.type}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{bike.name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{bike.description}</p>
        </div>

        {/* Rating */}
        {/* <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">(4.9) • 127 reviews</span>
        </div> */}
        
        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Features:</h4>
          <div className="grid grid-cols-2 gap-2">
            {bike.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
          {bike.features.length > 4 && (
            <p className="text-xs text-gray-500 mt-2">
              +{bike.features.length - 4} more features
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ${bike.price_per_day}
                <span className="text-sm font-normal text-gray-500">/day</span>
              </div>
              {bike.price_per_hour > 0 && (
                <div className="text-sm text-gray-500">
                  ${bike.price_per_hour}/hour also available
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600 font-semibold">Best Price</div>
              <div className="text-xs text-gray-500">in HRM</div>
            </div>
          </div>
        </div>
        
        {/* Book Button */}
        <button
          onClick={() => onBook(bike)}
          disabled={!bike.available}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
            bike.available
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {bike.available ? (
            <span className="flex items-center justify-center">
              <Zap className="h-5 w-5 mr-2" />
              Book Now
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              Currently Rented
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default BikeCard