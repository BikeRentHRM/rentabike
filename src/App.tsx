import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LoadingScreen from './components/LoadingScreen'
import Home from './pages/Home'
import Admin from './pages/Admin'
import TermsAndConditions from './pages/TermsAndConditions'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // DEV: show real loader → use your LoadingScreen callback
  // PROD: auto-dismiss after 1s to avoid deployment issues
  useEffect(() => {
    if (import.meta.env.PROD) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />
  }

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/terms" element={<TermsAndConditions />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App