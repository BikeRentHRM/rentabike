import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X, Clock, CreditCard } from 'lucide-react'

interface NotificationPopupProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, autoClose, duration, onClose])

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          closeColor: 'text-green-500 hover:text-green-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          closeColor: 'text-red-500 hover:text-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          closeColor: 'text-yellow-500 hover:text-yellow-700'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info className="h-6 w-6 text-blue-600" />,
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          closeColor: 'text-blue-500 hover:text-blue-700'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </h3>
            <div className={`mt-1 text-sm ${styles.messageColor}`}>
              {message.split('\n').map((line, index) => (
                <p key={index} className={index > 0 ? 'mt-1' : ''}>
                  {line}
                </p>
              ))}
            </div>
            
            {/* Special content for booking confirmations */}
            {type === 'success' && title === 'Booking Confirmed!' && (
              <div className="mt-3 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center text-green-800 font-medium mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  Payment Required (3 Hours)
                </div>
                <div className="space-y-1 text-xs text-green-700">
                  <div className="flex items-center">
                    <CreditCard className="h-3 w-3 mr-1" />
                    <span>E-Transfer: <strong>rentabikehrm@gmail.com</strong></span>
                  </div>
                  <p>⏰ Booking held for 3 hours pending payment</p>
                  <p>✅ Confirmation email sent with full details</p>
                </div>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 transition-colors ${styles.closeColor}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all ease-linear ${
                type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default NotificationPopup