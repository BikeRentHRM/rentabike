// Authentication utilities for admin panel
export interface AuthResponse {
  success?: boolean
  error?: string
  token?: string
  message?: string
  valid?: boolean
  admin?: boolean
}

export class AuthService {
  private static readonly TOKEN_KEY = 'admin_token'

  // Login with password
  static async login(password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/.netlify/functions/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          password
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem(this.TOKEN_KEY, data.token)
        return data
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      return {
        error: 'Network error',
        message: 'Failed to connect to authentication service'
      }
    }
  }

  // Verify stored token
  static async verifyToken(): Promise<boolean> {
    const token = localStorage.getItem(this.TOKEN_KEY)
    
    if (!token) {
      return false
    }

    try {
      const response = await fetch('/.netlify/functions/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token
        })
      })

      const data = await response.json()
      return response.ok && data.valid
    } catch (error) {
      console.error('Token verification error:', error)
      return false
    }
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  // Logout (clear token)
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
  }

  // Check if user is logged in (has valid token)
  static async isAuthenticated(): Promise<boolean> {
    return await this.verifyToken()
  }
}