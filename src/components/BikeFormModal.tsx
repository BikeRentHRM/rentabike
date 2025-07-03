import React, { useState, useEffect } from 'react'
import { X, Save, Upload, Plus } from 'lucide-react'
import { Bike } from '../types'

interface BikeFormModalProps {
  bike?: Bike | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (bikeData: any) => void
  isEditing?: boolean
}

const BikeFormModal: React.FC<BikeFormModalProps> = ({ 
  bike, 
  isOpen, 
  onClose, 
  onSubmit, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'City Bike',
    description: '',
    price_per_hour: 0,
    price_per_day: 20,
    image_url: '',
    available: true,
    features: ['']
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (bike && isEditing) {
      setFormData({
        name: bike.name,
        type: bike.type,
        description: bike.description,
        price_per_hour: bike.price_per_hour,
        price_per_day: bike.price_per_day,
        image_url: bike.image_url,
        available: bike.available,
        features: bike.features.length > 0 ? bike.features : ['']
      })
    } else {
      // Reset form for new bike
      setFormData({
        name: '',
        type: 'City Bike',
        description: '',
        price_per_hour: 0,
        price_per_day: 20,
        image_url: '',
        available: true,
        features: ['']
      })
    }
  }, [bike, isEditing, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const bikeData = {
        ...formData,
        features: formData.features.filter(feature => feature.trim() !== '')
      }
      await onSubmit(bikeData)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures
    })
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : ['']
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? `Edit ${bike?.name}` : 'Add New Bike'}
            </h2>
            <p className="text-blue-100 text-sm">
              {isEditing ? 'Update bike information' : 'Add a new bike to your fleet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bike Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Urban Explorer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bike Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="City Bike">City Bike</option>
                <option value="Mountain Bike">Mountain Bike</option>
                <option value="Hybrid Bike">Hybrid Bike</option>
                <option value="Electric Bike">Electric Bike</option>
                <option value="Road Bike">Road Bike</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the bike and its best use cases..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="20.00"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://images.pexels.com/photos/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use high-quality images from Pexels or other free stock photo sites
              </p>
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                  Bike is available for rental
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., LED Lights, Basket, 7 Gears"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Feature
              </button>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Bike' : 'Add Bike'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BikeFormModal