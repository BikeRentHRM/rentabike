import React, { useState, useEffect } from 'react'
import { Bike } from 'lucide-react'

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Preparing your ride...')

  const loadingMessages = [
    'Preparing your ride...',
    'Checking tire pressure...',
    'Adjusting the seat...',
    'Testing the brakes...',
    'Ready to explore Halifax!'
  ]

  useEffect(() => {
    console.log('LoadingScreen mounted')
    let messageIndex = 0
    let progressValue = 0
    let isMounted = true
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      if (!isMounted) return
      
      progressValue += Math.random() * 15 + 5 // Random increment between 5-20
      if (progressValue >= 100) {
        progressValue = 100
        clearInterval(progressInterval)
        
        // Complete loading
        setProgress(100)
        setLoadingText('Ready to explore Halifax!')
        
        setTimeout(() => {
          if (isMounted) {
            console.log('Calling onLoadingComplete')
            onLoadingComplete()
          }
        }, 300)
      } else {
        setProgress(progressValue)
      }
    }, 200)

    // Update loading text periodically
    const textInterval = setInterval(() => {
      if (!isMounted) return
      
      if (messageIndex < loadingMessages.length - 1) {
        messageIndex++
        setLoadingText(loadingMessages[messageIndex])
      }
    }, 600)

    // Fallback timeout to ensure loading never gets stuck
    const fallbackTimeout = setTimeout(() => {
      if (!isMounted) return
      
      console.log('Fallback timeout triggered')
      clearInterval(progressInterval)
      clearInterval(textInterval)
      setProgress(100)
      setLoadingText('Ready to explore Halifax!')
      onLoadingComplete()
    }, 3000) // 3 second maximum

    return () => {
      isMounted = false
      clearInterval(progressInterval)
      clearInterval(textInterval)
      clearTimeout(fallbackTimeout)
    }
  }, [onLoadingComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-green-900 to-blue-900 flex items-center justify-center z-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 text-center text-white max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full inline-block shadow-2xl">
            <Bike className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
            Rent A Bike
          </span>
        </h1>
        <p className="text-blue-200 mb-8 text-lg">Halifax's Cheapest Daily Rentals</p>

        {/* Spinning bike wheel */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Outer wheel */}
            <div className="w-24 h-24 border-4 border-blue-300/30 rounded-full animate-spin" style={{
              animationDuration: '3s'
            }}>
              {/* Spokes */}
              <div className="absolute inset-2 border-2 border-green-400/50 rounded-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-green-400/70"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-45">
                  <div className="w-full h-0.5 bg-green-400/70"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-90">
                  <div className="w-full h-0.5 bg-green-400/70"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                  <div className="w-full h-0.5 bg-green-400/70"></div>
                </div>
              </div>
              {/* Hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-green-400 rounded-full shadow-lg"></div>
              </div>
            </div>
            
            {/* Inner spinning element */}
            <div className="absolute inset-4 border-2 border-blue-400/60 rounded-full animate-spin" style={{
              animationDuration: '2s',
              animationDirection: 'reverse'
            }}></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="mb-6">
          <p className="text-xl font-medium text-blue-100 animate-pulse">
            {loadingText}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-blue-900/50 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Progress percentage */}
        <p className="text-blue-200 text-sm font-medium">
          {Math.round(progress)}% loaded
        </p>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{
          animationDelay: '0s',
          animationDuration: '2s'
        }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-green-400/60 rounded-full animate-bounce" style={{
          animationDelay: '0.5s',
          animationDuration: '2.5s'
        }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-300/60 rounded-full animate-bounce" style={{
          animationDelay: '1s',
          animationDuration: '3s'
        }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-green-300/60 rounded-full animate-bounce" style={{
          animationDelay: '1.5s',
          animationDuration: '2s'
        }}></div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-blue-200/80 text-sm">
          🏆 Starting from just $20/day
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen