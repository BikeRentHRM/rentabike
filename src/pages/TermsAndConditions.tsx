import React from 'react'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { Shield, AlertTriangle, FileText, Phone } from 'lucide-react'

const TermsAndConditions: React.FC = () => {
  return (
    <Layout>
      <SEO 
        title="Terms and Conditions - Rent A Bike Halifax"
        description="Terms and conditions for bike rental services in Halifax Regional Municipality. Read our rental policies, damage liability, and safety requirements."
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <FileText className="h-4 w-4 mr-2" />
                Legal Document
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Terms and Conditions
              </h1>
              <p className="text-xl text-gray-600">
                Bike Rental Services - Halifax Regional Municipality
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: January 2025
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-blue-600" />
                Rental Agreement
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  By renting a bicycle from Rent A Bike ("Company"), you ("Renter") agree to the following terms and conditions. 
                  This agreement is legally binding and governs the rental of bicycles and related equipment.
                </p>
              </div>
            </section>

            {/* Age and Requirements */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Age and Requirements</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Renters must be 18 years of age or older, or accompanied by a parent/guardian
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Valid government-issued photo identification required for all rentals
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Renter must demonstrate basic cycling competency and balance
                </li>
              </ul>
            </section>

            {/* Damage and Liability */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Damage and Liability
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Important: Renter Responsibility</h4>
                <p className="text-red-700 text-sm">
                  The renter is fully responsible for any damage, loss, or theft of the bicycle and equipment during the rental period.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Damage Charges:</h4>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li>• Minor repairs (flat tire, brake adjustment): $25 - $75</li>
                    <li>• Major repairs (wheel replacement, frame damage): $100 - $300</li>
                    <li>• Complete bicycle replacement: $400 - $1,200 (depending on model)</li>
                    <li>• Lost or stolen bicycle: Full replacement value + $100 processing fee</li>
                    <li>• Lost helmet or accessories: $25 - $50 per item</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Liability Coverage:</h4>
                  <ul className="space-y-2 text-gray-700 ml-4">
                    <li>• Renter assumes all risk of injury or property damage</li>
                    <li>• Company is not liable for accidents, injuries, or damages</li>
                    <li>• Renter agrees to indemnify Company against all claims</li>
                    <li>• Personal insurance coverage is strongly recommended</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Safety Requirements */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety Requirements</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Mandatory Safety Rules</h4>
                <ul className="space-y-1 text-yellow-700 text-sm">
                  <li>• Helmet must be worn at all times while riding (provided free)</li>
                  <li>• Follow all traffic laws and cycling regulations</li>
                  <li>• No riding under the influence of alcohol or drugs</li>
                  <li>• Maximum one rider per bicycle (no passengers)</li>
                </ul>
              </div>
              
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Bicycles must be returned in the same condition as rented
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Report any mechanical issues immediately
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Use provided locks when bicycle is unattended
                </li>
              </ul>
            </section>

            {/* Rental Terms */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Rental Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment and Fees:</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Payment required in advance via e-transfer</li>
                    <li>• Late return fee: $10 per hour</li>
                    <li>• Cleaning fee for excessively dirty bikes: $25</li>
                    <li>• No refunds for early returns</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancellation Policy:</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Free cancellation up to 24 hours before rental</li>
                    <li>• 50% refund for cancellations within 24 hours</li>
                    <li>• No refund for no-shows</li>
                    <li>• Weather-related cancellations: full refund</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Uses</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <ul className="space-y-2 text-red-700">
                  <li>• Racing, stunts, or extreme cycling activities</li>
                  <li>• Riding on private property without permission</li>
                  <li>• Modifications or repairs to the bicycle</li>
                  <li>• Subletting or transferring rental to another person</li>
                  <li>• Using bicycle for commercial purposes</li>
                  <li>• Riding in areas prohibited by local authorities</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Phone className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">24/7 Emergency Support</span>
                </div>
                <div className="space-y-2 text-blue-700">
                  <p><strong>Phone:</strong> (902) 414-5894</p>
                  <p><strong>Email:</strong> rentabikehrm@gmail.com</p>
                  <p><strong>Address:</strong> 4 Leaman Dr, Dartmouth, NS B3A 2K5</p>
                </div>
              </div>
            </section>

            {/* Legal */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Terms</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  This agreement is governed by the laws of Nova Scotia, Canada. Any disputes will be resolved 
                  in the courts of Nova Scotia. If any provision is found unenforceable, the remainder remains valid.
                </p>
                <p>
                  By signing the rental agreement or proceeding with online booking, you acknowledge that you have 
                  read, understood, and agree to be bound by these terms and conditions.
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center text-sm text-gray-500">
                <p>© 2025 Rent A Bike. All rights reserved.</p>
                <p className="mt-1">
                  Questions about these terms? Contact us at 
                  <a href="tel:+1-902-414-5894" className="text-blue-600 hover:text-blue-800 ml-1">
                    (902) 414-5894
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default TermsAndConditions