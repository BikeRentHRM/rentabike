import React, { useState } from 'react'
import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../SEO'
import { AuthService } from '../../lib/auth'

interface AdminLoginProps {
  onLoginSuccess: () => void
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await AuthService.login(password)
      
      if (result.success) {
        onLoginSuccess()
      } else {
        setError(result.message || result.error || 'Login failed')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <SEO title="Admin Login - Rent Bikes HRM" />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <Link 
            to="/"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
              disabled={isLoading}
              placeholder="Enter admin password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Authenticating...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
          <p>🔒 Secure authentication powered by serverless functions</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin