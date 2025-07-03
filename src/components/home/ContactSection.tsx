import React from 'react'
import { MapPin, Phone, Mail, Clock, Car, Star } from 'lucide-react'

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Visit Our Dartmouth Location
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conveniently located in Dartmouth with easy access from anywhere in HRM. 
            Free parking and friendly service await!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Location Card */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                Our Dartmouth Location
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">4 Leaman Dr</p>
                    <p className="text-gray-600">Dartmouth, NS B3A 2K5</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Car className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-gray-700">Free on-site parking available</p>
                </div>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Get In Touch</h3>
              
              <div className="space-y-4">
                <a 
                  href="tel:+1-902-414-5894"
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-lg transition-colors">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">(902) 414-5894</p>
                    <p className="text-sm text-gray-600">Call for instant booking</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:rentabikehrm@gmail.com"
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-green-50 transition-colors group"
                >
                  <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg transition-colors">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">rentabikehrm@gmail.com</p>
                    <p className="text-sm text-gray-600">Email us your questions</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                <Clock className="h-6 w-6 mr-3 text-purple-600" />
                Operating Hours
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Monday - Sunday</span>
                  <span className="font-semibold text-gray-900">8:00 AM - 8:00 PM</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">
                    Extended hours available by arrangement. Call us to discuss your needs!
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-yellow-50 p-8 rounded-2xl border border-yellow-200">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                <Star className="h-6 w-6 mr-3 text-yellow-500 fill-current" />
                Customer Reviews
              </h3>
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-gray-700 font-semibold">4.9/5 (127 reviews)</span>
              </div>
              <p className="text-gray-700 italic">
                "Best bike rental experience in Halifax! Great prices, quality bikes, and excellent service."
              </p>
              <p className="text-sm text-gray-600 mt-2">- Sarah M., Halifax</p>
            </div>
          </div>
          
          {/* Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <h3 className="text-xl font-bold">Find Us on the Map</h3>
                <p className="text-blue-100">Easy to reach from anywhere in HRM</p>
              </div>
              
              <div className="relative h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2839.8234567890123!2d-63.5752!3d44.6488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b5a23e6f1234567%3A0x1234567890abcdef!2s4%20Leaman%20Dr%2C%20Dartmouth%2C%20NS%20B3A%202K5!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rent A Bike Location - 4 Leaman Dr, Dartmouth, NS"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
            
            {/* Directions */}
            {/* <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
              <h4 className="font-bold text-gray-900 mb-3">🚗 Getting Here</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>From Halifax:</strong> Take MacDonald Bridge to Dartmouth, follow signs to Eastern Passage</p>
                <p><strong>From Bedford:</strong> Take Highway 102 South to Exit 7, follow Route 7 to Dartmouth</p>
                <p><strong>Parking:</strong> Free parking available directly on-site</p>
              </div>
            </div> */}
            
            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8 rounded-2xl text-white text-center">
              <h4 className="text-xl font-bold mb-4">Ready to Start Your Adventure?</h4>
              <p className="mb-6 text-blue-100">
                Call ahead to reserve your bike and ensure availability
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+1-902-414-5894"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Call (902) 414-5894
                </a>
                <button 
                  onClick={() => document.getElementById('bikes')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse Bikes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection