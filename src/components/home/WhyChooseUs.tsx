import React from 'react'
import { Shield, DollarSign, Clock, Award, Users, Wrench } from 'lucide-react'

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Best Prices Guaranteed",
      description: "Unbeatable daily rates starting from $20. We match any competitor's price.",
      color: "green"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Premium Quality",
      description: "All bikes are professionally maintained and safety-checked before every rental.",
      color: "blue"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Flexible Rentals",
      description: "Hourly, daily, or weekly rentals. Pick up and drop off at your convenience.",
      color: "purple"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "5-Star Service",
      description: "Rated #1 bike rental service in Halifax by our satisfied customers.",
      color: "orange"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Local Expertise",
      description: "Get insider tips on the best cycling routes and hidden gems in HRM.",
      color: "indigo"
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Full Support",
      description: "24/7 roadside assistance and free helmet with every rental.",
      color: "red"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: "bg-green-50 text-green-600 border-green-200",
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
      red: "bg-red-50 text-red-600 border-red-200"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Rent A Bike?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing the best bike rental experience in Halifax Regional Municipality
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${getColorClasses(feature.color)}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Adventure?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who've explored HRM with our bikes
            </p>
            <button 
              onClick={() => document.getElementById('bikes')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Browse Our Fleet
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs