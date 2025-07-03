import { useState, useCallback } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  autoClose?: boolean
  duration?: number
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    return id
  }, [])

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    return showNotification({ type: 'success', title, message, ...options })
  }, [showNotification])

  const showError = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    return showNotification({ type: 'error', title, message, ...options })
  }, [showNotification])

  const showWarning = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    return showNotification({ type: 'warning', title, message, ...options })
  }, [showNotification])

  const showInfo = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    return showNotification({ type: 'info', title, message, ...options })
  }, [showNotification])

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}