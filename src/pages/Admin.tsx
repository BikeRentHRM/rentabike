import React, { useState, useEffect } from 'react'
import { BarChart3, Bike as BikeIcon, Calendar, Eye, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthService } from '../lib/auth'
import SEO from '../components/SEO'
import BikeFormModal from '../components/BikeFormModal'
import NotificationPopup from '../components/NotificationPopup'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'
import BookingsTab from '../components/admin/BookingsTab'
import BikesTab from '../components/admin/BikesTab'
import AnalyticsTab from '../components/admin/AnalyticsTab'
import { useNotification } from '../hooks/useNotification'
import { Bike, Booking, SiteVisit } from '../types'

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bikes, setBikes] = useState<Bike[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(false)
  
  // Bike form modal state
  const [isBikeModalOpen, setIsBikeModalOpen] = useState(false)
  const [editingBike, setEditingBike] = useState<Bike | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { notifications, hideNotification, showSuccess, showError } = useNotification()

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsCheckingAuth(true)
    try {
      const isAuth = await AuthService.isAuthenticated()
      setIsAuthenticated(isAuth)
      if (isAuth) {
        fetchAllData()
      }
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    fetchAllData()
  }

  const handleLogout = () => {
    AuthService.logout()
    setIsAuthenticated(false)
    setBikes([])
    setBookings([])
    setSiteVisits([])
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch bikes using admin serverless function
      await fetchBikes()

      // Fetch bookings using serverless function
      await fetchBookings()

      // Fetch site visits using Supabase directly (as before)
      const { data: visitsData } = await supabase
        .from('site_visits')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(100)
      setSiteVisits(visitsData || [])
    } catch (error) {
      showError('Data Fetch Error', 'Failed to load admin data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchBikes = async () => {
    try {
      const response = await fetch('/.netlify/functions/manage-bikes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch bikes')
      }

      const bikesData = await response.json()
      setBikes(bikesData || [])
    } catch (error) {
      setBikes([])
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/.netlify/functions/manage-bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch bookings')
      }

      const bookingsData = await response.json()
      setBookings(bookingsData || [])
    } catch (error) {
      setBookings([])
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/.netlify/functions/manage-bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking')
      }

      const result = await response.json()
      
      showSuccess('Status Updated', `Booking status has been updated to ${status}. Customer will be notified via email.`)
      
      // Refresh bookings list
      fetchBookings()
    } catch (error) {
      showError('Update Failed', `Failed to update booking status: ${error.message}`)
    }
  }

  const handleAddBike = () => {
    setEditingBike(null)
    setIsEditing(false)
    setIsBikeModalOpen(true)
  }

  const handleEditBike = (bike: Bike) => {
    setEditingBike(bike)
    setIsEditing(true)
    setIsBikeModalOpen(true)
  }

  const handleDeleteBike = async (bikeId: string) => {
    if (!confirm('Are you sure you want to delete this bike? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/.netlify/functions/manage-bikes?id=${bikeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete bike')
      }

      const result = await response.json()
      
      showSuccess('Bike Deleted', result.message || 'Bike deleted successfully!')
      fetchBikes() // Refresh bikes list
    } catch (error) {
      showError('Delete Failed', `Failed to delete bike: ${error.message}`)
    }
  }

  const handleBikeSubmit = async (bikeData: any) => {
    try {
      const url = isEditing 
        ? `/.netlify/functions/manage-bikes?id=${editingBike?.id}`
        : '/.netlify/functions/manage-bikes'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bikeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} bike`)
      }

      const result = await response.json()
      
      showSuccess(
        isEditing ? 'Bike Updated' : 'Bike Added',
        `Bike ${isEditing ? 'updated' : 'added'} successfully!`
      )
      
      setIsBikeModalOpen(false)
      setEditingBike(null)
      setIsEditing(false)
      fetchBikes() // Refresh bikes list
    } catch (error) {
      showError(
        isEditing ? 'Update Failed' : 'Add Failed',
        `Failed to ${isEditing ? 'update' : 'add'} bike: ${error.message}`
      )
    }
  }

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SEO title="Admin Dashboard - Rent Bikes HRM" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="text-sm">Home</span>
              </Link>
              <span className="text-sm text-gray-600">🔒 Authenticated</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('bikes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bikes'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BikeIcon className="h-4 w-4 inline mr-1" />
              Bikes
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-1" />
              Analytics
            </button>
          </nav>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500"></div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard bikes={bikes} bookings={bookings} />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} onUpdateBookingStatus={updateBookingStatus} />
        )}

        {activeTab === 'bikes' && (
          <BikesTab 
            bikes={bikes} 
            onAddBike={handleAddBike}
            onEditBike={handleEditBike}
            onDeleteBike={handleDeleteBike}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab siteVisits={siteVisits} />
        )}
      </div>

      <BikeFormModal
        bike={editingBike}
        isOpen={isBikeModalOpen}
        onClose={() => {
          setIsBikeModalOpen(false)
          setEditingBike(null)
          setIsEditing(false)
        }}
        onSubmit={handleBikeSubmit}
        isEditing={isEditing}
      />

      {/* Notification Popups */}
      {notifications.map((notification) => (
        <NotificationPopup
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={true}
          onClose={() => hideNotification(notification.id)}
          autoClose={notification.autoClose}
          duration={notification.duration}
        />
      ))}
    </div>
  )
}

export default Admin