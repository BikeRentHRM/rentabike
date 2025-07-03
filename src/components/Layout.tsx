import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bike, Phone, Mail, MapPin, Calendar, Menu, X, FileText } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`
      return
    }
    
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    setIsMobileMenuOpen(false)
  }

  const handleBookNowClick = () => {
    if (location.pathname !== '/') {
      window.location.href = '/#bikes'
    } else {
      scrollToSection('bikes')
    }
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { label: 'Home', action: () => location.pathname === '/' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : window.location.href = '/' },
    { label: 'Our Bikes', action: () => scrollToSection('bikes') },
    { label: 'Trails', action: () => scrollToSection('trails') },
    { label: 'Contact', action: () => scrollToSection('contact') }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2.5 rounded-xl group-hover:shadow-lg transition-all duration-300">
                <Bike className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Rent A Bike</span>
                <div className="text-xs text-gray-500">Dartmouth's Affordable Rentals</div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Desktop Contact & CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <a 
                href="tel:+1-902-414-5894" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="font-medium">(902) 414-5894</span>
              </a>

              <button
                onClick={handleBookNowClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Now</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4">
              <div className="flex flex-col space-y-4">
                {/* Mobile Book Now CTA */}
                <button 
                  onClick={handleBookNowClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-bold text-lg shadow-lg flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Book a Bike Now!</span>
                </button>
                
                {/* Navigation Links */}
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 px-2 text-left rounded hover:bg-blue-50"
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Mobile Contact */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Contact Us:</p>
                  <div className="space-y-2">
                    <a 
                      href="tel:+1-902-414-5894"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors py-1"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">(902) 414-5894</span>
                    </a>
                    <a 
                      href="mailto:rentabikehrm@gmail.com" 
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors py-1"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">rentabikehrm@gmail.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                  <Bike className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Rent A Bike</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Halifax Regional Municipality's premier bike rental service. 
                Offering unbeatable rates on quality bikes since 2024.
              </p>
              <div className="flex space-x-4">
                <a href="tel:+1-902-414-5894" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                  Call Now
                </a>
                <a href="mailto:rentabikehrm@gmail.com" className="border border-gray-600 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors">
                  Email Us
                </a>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">(902) 414-5894</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">rentabikehrm@gmail.com</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="text-gray-300">
                    <div>4 Leaman Dr</div>
                    <div>Dartmouth, NS B3A 2K5</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Service Areas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
              <ul className="text-gray-300 space-y-2">
                <li>Halifax Peninsula</li>
                <li>Dartmouth</li>
                <li>Bedford</li>
                <li>Sackville</li>
                <li>Eastern Passage</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2025 Rent A Bike. All rights reserved. • Halifax's most trusted bike rental service.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link 
                  to="/terms" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <FileText className="h-4 w-4" />
                  <span>Terms & Conditions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout