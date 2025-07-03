import React from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Bike } from '../../types'

interface BikesTabProps {
  bikes: Bike[]
  onAddBike: () => void
  onEditBike: (bike: Bike) => void
  onDeleteBike: (bikeId: string) => void
}

const BikesTab: React.FC<BikesTabProps> = ({ bikes, onAddBike, onEditBike, onDeleteBike }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Bike Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your bike fleet with secure operations
          </p>
        </div>
        <button 
          onClick={onAddBike}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors shadow-lg"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Add Bike
        </button>
      </div>
      
      {bikes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bikes found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first bike to the fleet.</p>
          <button 
            onClick={onAddBike}
            className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
          >
            Add Your First Bike
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikes.map((bike) => (
            <div key={bike.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={bike.image_url} 
                  alt={bike.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bike.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bike.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{bike.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {bike.type}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bike.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-bold text-green-600">
                    ${bike.price_per_day}/day
                  </div>
                  {bike.price_per_hour > 0 && (
                    <div className="text-sm text-gray-500">
                      ${bike.price_per_hour}/hr
                    </div>
                  )}
                </div>
                
                {bike.features && bike.features.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {bike.features.slice(0, 3).map((feature, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {bike.features.length > 3 && (
                        <span className="text-gray-500 text-xs">+{bike.features.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEditBike(bike)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors font-medium"
                  >
                    <Edit className="h-3 w-3 inline mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteBike(bike.id)}
                    className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm hover:bg-red-200 transition-colors font-medium"
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-500 text-lg">🔧</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Secure Bike Management</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>All bike management operations are handled securely with:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Enhanced security with server-side validation</li>
                <li>Consistent data handling across all operations</li>
                <li>Automatic scaling and high availability</li>
                <li>Centralized business logic and error handling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BikesTab