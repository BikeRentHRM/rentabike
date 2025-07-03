import React, { useState, useEffect } from 'react'
import { X, User, Phone, Mail, Zap, DollarSign, MapPin, CreditCard, CheckCircle, Clock, Sparkles, AlertCircle, FileText } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Link } from 'react-router-dom'
import CalendarPicker from './CalendarPicker'
import { Bike } from '../types'

interface BookingModalProps {
  bike: Bike | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (bookingData: any) => Promise<any>
}

const BookingModal: React.FC<BookingModalProps> = ({ bike, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: ''
  })

  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [animationStep, setAnimationStep] = useState(0)
  const [bookedDates, setBookedDates] = useState<Date[]>([])
  const [loadingBookedDates, setLoadingBookedDates] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Fetch booked dates for the selected bike
  const fetchBookedDates = async (bikeId: string) => {
    if (!bikeId) return

    setLoadingBookedDates(true)
    
    try {
      const response = await fetch(`/.netlify/functions/get-booked-dates?bike_id=${bikeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Convert ISO strings back to Date objects
        const dates = (data.bookedDates || []).map((dateStr: string) => {
          return new Date(dateStr)
        })
        
        setBookedDates(dates)
      } else {
        setBookedDates([])
      }
    } catch (error) {
      setBookedDates([])
    } finally {
      setLoadingBookedDates(false)
    }
  }

  // Fetch booked dates when bike changes or modal opens
  useEffect(() => {
    if (bike?.id && isOpen) {
      fetchBookedDates(bike.id)
    }
  }, [bike?.id, isOpen])

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)
    // Clear any previous errors when dates change
    setShowError(false)
    setErrorMessage('')
  }

  // Handle clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showConfirmation) {
      onClose()
    }
  }

  const calculateCost = () => {
    if (!bike || !selectedStartDate) return 0
    
    const endDate = selectedEndDate || selectedStartDate
    const days = Math.max(1, differenceInDays(endDate, selectedStartDate) + 1)
    
    return days * bike.price_per_day
  }

  const getDays = () => {
    if (!selectedStartDate) return 0
    
    const endDate = selectedEndDate || selectedStartDate
    return Math.max(1, differenceInDays(endDate, selectedStartDate) + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStartDate) {
      setErrorMessage('Please select rental dates')
      setShowError(true)
      return
    }

    if (!acceptedTerms) {
      setErrorMessage('Please accept the Terms and Conditions to proceed with your booking')
      setShowError(true)
      return
    }
    
    setIsSubmitting(true)
    setShowError(false)
    setErrorMessage('')
    
    const endDate = selectedEndDate || selectedStartDate
    const days = getDays()
    
    const bookingData = {
      bike_id: bike?.id,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      start_date: selectedStartDate.toISOString(),
      end_date: endDate.toISOString(),
      duration_hours: days * 24,
      total_cost: calculateCost(),
      special_requests: formData.specialRequests,
      status: 'pending'
    }
    
    try {
      await onSubmit(bookingData)
      setIsSubmitting(false)
      setShowConfirmation(true)
      
      // Start animation sequence
      setTimeout(() => setAnimationStep(1), 100)
      setTimeout(() => setAnimationStep(2), 800)
      setTimeout(() => setAnimationStep(3), 1500)
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(error.message || 'Failed to create booking. Please try again.')
      setShowError(true)
    }
  }

  const handleCloseModal = () => {
    setShowConfirmation(false)
    setShowError(false)
    setErrorMessage('')
    setAnimationStep(0)
    onClose()
  }

  const handleRetryBooking = () => {
    setShowError(false)
    setErrorMessage('')
    // Refresh booked dates in case they changed
    if (bike?.id) {
      fetchBookedDates(bike.id)
    }
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialRequests: ''
      })
      setSelectedStartDate(null)
      setSelectedEndDate(null)
      setShowConfirmation(false)
      setShowError(false)
      setErrorMessage('')
      setAnimationStep(0)
      setBookedDates([])
      setAcceptedTerms(false)
    }
  }, [isOpen])

  if (!isOpen || !bike) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold">
              {showConfirmation ? 'Booking Confirmed!' : showError ? 'Booking Failed' : `Book ${bike.name}`}
            </h2>
            <p className="text-blue-100 text-sm">
              {showConfirmation ? 'Payment required within 3 hours' : 
               showError ? 'Please try again or contact us' :
               'Best daily rates in Halifax Regional Municipality!'}
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {showError ? (
          // Error Screen
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-red-800 mb-2">Booking Failed</h3>
              <p className="text-red-600 mb-4">{errorMessage}</p>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">What you can do:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Try selecting different dates</li>
                <li>• Check if the dates are already booked (shown in red)</li>
                <li>• Contact us directly at (902) 414-5894</li>
                <li>• Email us at rentabikehrm@gmail.com</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRetryBooking}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : !showConfirmation ? (
          // Booking Form - More Compact Layout
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Calendar (Reduced Size) */}
              <div className="lg:col-span-2">
                <div className="transform scale-90 origin-top-left">
                  {loadingBookedDates ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading availability...</p>
                      </div>
                    </div>
                  ) : (
                    <CalendarPicker
                      onDateRangeChange={handleDateRangeChange}
                      bookedDates={bookedDates}
                      minDate={new Date()}
                    />
                  )}
                </div>
              </div>

              {/* Right Column - Booking Summary (Compact) */}
              <div className="space-y-4">
                {/* Booking Summary */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Summary
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Bike:</span>
                      <span className="font-medium text-green-800">{bike.name}</span>
                    </div>
                    
                    {selectedStartDate && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-green-700">Start:</span>
                          <span className="font-medium text-green-800">
                            {format(selectedStartDate, 'MMM dd')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-green-700">End:</span>
                          <span className="font-medium text-green-800">
                            {format(selectedEndDate || selectedStartDate, 'MMM dd')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-green-700">Days:</span>
                          <span className="font-medium text-green-800">{getDays()}</span>
                        </div>
                        
                        <div className="border-t border-green-200 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-green-800 font-bold">Total:</span>
                            <span className="text-green-600 text-xl font-bold">${calculateCost().toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded-lg border border-green-200">
                    <p className="text-green-700 text-xs">
                      🎉 Lowest daily rates in HRM guaranteed!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information - Compact Grid */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-3 w-3 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-3 w-3 inline mr-1" />
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="(902) 414-5894"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-3 w-3 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Any special requirements..."
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <div className="flex-1">
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-blue-600" />
                      <span className="font-medium">I accept the Terms and Conditions *</span>
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      By checking this box, I acknowledge that I have read and agree to the 
                      <Link 
                        to="/terms" 
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 underline mx-1"
                      >
                        Terms and Conditions
                      </Link>
                      including damage liability, safety requirements, and rental policies.
                    </p>
                  </label>
                </div>
              </div>
              
              {!acceptedTerms && (
                <div className="mt-2 text-xs text-red-600">
                  You must accept the Terms and Conditions to proceed with your booking.
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedStartDate || loadingBookedDates || !acceptedTerms}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : loadingBookedDates ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </span>
                )}
              </button>
            </div>
          </form>
        ) : (
          // Confirmation Screen with Animations (unchanged)
          <div className="p-6 space-y-6">
            {/* Success Animation */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 transform transition-all duration-1000 ${
                animationStep >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}>
                <CheckCircle className={`h-12 w-12 text-green-600 transition-all duration-500 ${
                  animationStep >= 2 ? 'scale-100' : 'scale-0'
                }`} />
              </div>
              
              <div className={`transform transition-all duration-700 ${
                animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
                <p className="text-green-600">Your bike rental is pending payment confirmation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Payment Instructions */}
              <div className={`space-y-4 transform transition-all duration-700 delay-300 ${
                animationStep >= 3 ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}>
                {/* Payment Instructions */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Instructions
                  </h3>
                  <div className="space-y-3 text-blue-700">
                    <div className="bg-white p-3 rounded-xl border-l-4 border-blue-500">
                      <p className="font-semibold text-blue-800">📧 E-Transfer Details:</p>
                      <p className="text-sm">Email: <strong>rentabikehrm@gmail.com</strong></p>
                      <p className="text-sm">Amount: <strong>${calculateCost().toFixed(2)}</strong></p>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                      <p className="font-semibold text-yellow-800 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Important Timing:
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Your booking will be held for <strong>3 hours</strong></li>
                        <li>• Send e-transfer within 3 hours to confirm</li>
                        <li>• Booking will be automatically cancelled if payment not received</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                      <p className="font-semibold text-green-800">✅ After Payment:</p>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• We'll confirm your booking via email</li>
                        <li>• You'll receive pickup instructions</li>
                        <li>• Bring valid ID for bike pickup</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Location & Booking Details */}
              <div className={`space-y-4 transform transition-all duration-700 delay-500 ${
                animationStep >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}>
                {/* Location */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Pickup Location
                  </h3>
                  
                  <div className="mb-3">
                    <p className="font-semibold text-gray-800">4 Leaman Dr, Dartmouth, NS B3A 2K5</p>
                    <p className="text-sm text-gray-600">Free parking available on-site</p>
                  </div>

                  {/* Compact Map */}
                  <div className="bg-white rounded-xl overflow-hidden shadow-md">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2839.8234567890123!2d-63.5752!3d44.6488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b5a23e6f1234567%3A0x1234567890abcdef!2s4%20Leaman%20Dr%2C%20Dartmouth%2C%20NS%20B3A%202K5!5e0!3m2!1sen!2sca!4v1234567890123!5m2!1sen!2sca"
                      width="100%"
                      height="150"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Rent A Bike Location"
                    ></iframe>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-3">Your Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Bike:</span>
                      <span className="font-medium text-green-800">{bike.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Customer:</span>
                      <span className="font-medium text-green-800">{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Email:</span>
                      <span className="font-medium text-green-800">{formData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Phone:</span>
                      <span className="font-medium text-green-800">{formData.customerPhone}</span>
                    </div>
                    {selectedStartDate && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-green-700">Dates:</span>
                          <span className="font-medium text-green-800">
                            {format(selectedStartDate, 'MMM dd')} - {format(selectedEndDate || selectedStartDate, 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Duration:</span>
                          <span className="font-medium text-green-800">{getDays()} day{getDays() > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                          <span className="text-green-700 font-bold">Total:</span>
                          <span className="font-bold text-green-600 text-lg">${calculateCost().toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sparkle Animation */}
            <div className="relative">
              {animationStep >= 3 && (
                <>
                  <Sparkles className="absolute top-0 left-1/4 h-6 w-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <Sparkles className="absolute top-0 right-1/4 h-4 w-4 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  <Sparkles className="absolute bottom-0 left-1/3 h-5 w-5 text-green-400 animate-bounce" style={{ animationDelay: '1s' }} />
                </>
              )}
              
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleCloseModal}
                  className="py-3 px-8 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-colors font-semibold shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingModal