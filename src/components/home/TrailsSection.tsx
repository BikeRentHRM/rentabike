import React from 'react'
import { Waves, TreePine, Camera, Mountain } from 'lucide-react'

const TrailsSection: React.FC = () => {
  const trails = [
    {
      name: "Halifax Waterfront Boardwalk",
      difficulty: "Easy",
      distance: "4 km",
      type: "Paved",
      description: "Scenic waterfront route perfect for families and casual riders. Enjoy stunning harbor views, historic sites, and plenty of photo opportunities.",
      highlights: ["Harbor views", "Historic properties", "Restaurants & cafes", "Ferry terminals"],
      image: "https://buildns.ca/wp-content/uploads/2019/04/news-28-02-2016.jpg",
      icon: <Waves className="h-6 w-6" />
    },
    {
      name: "Shearwater Flyer Trail",
      difficulty: "Easy",
      distance: "11 km",
      type: "Paved",
      description: "Former railway converted to a beautiful multi-use trail connecting Dartmouth to Eastern Passage. Perfect for leisurely rides through forests and communities.",
      highlights: ["Forest canopy", "Wildlife viewing", "Historic railway bridges", "Community connections"],
      image: "https://live.staticflickr.com/65535/50265358293_2c60bba8b9_b.jpg",
      icon: <TreePine className="h-6 w-6" />
    },
    {
      name: "Salt Marsh Trail",
      difficulty: "Easy",
      distance: "7 km",
      type: "Paved",
      description: "Beautiful trail through Bedford's salt marshes offering unique ecosystem views and bird watching opportunities. Great for nature lovers.",
      highlights: ["Salt marsh ecosystem", "Bird watching", "Interpretive signs", "Peaceful scenery"],
      image: "https://novascotia.com/wp-content/uploads/2024/09/36086.webp",
      icon: <Camera className="h-6 w-6" />
    },
    {
      name: "BLT (Bedford-Sackville Greenway)",
      difficulty: "Easy to Moderate",
      distance: "8 km",
      type: "Paved",
      description: "Connects Bedford and Lower Sackville through beautiful wooded areas. Perfect for longer recreational rides with gentle hills.",
      highlights: ["Wooded sections", "Community connections", "Gentle hills", "Rest areas"],
      image: "https://live.staticflickr.com/4481/37393646464_a80d9d65dd_b.jpg",
      icon: <TreePine className="h-6 w-6" />
    },
    {
      name: "Shubie Canal Greenway",
      difficulty: "Easy",
      distance: "5 km",
      type: "Paved",
      description: "Historic canal route through Dartmouth offering a mix of urban and natural settings. Rich in local history and perfect for educational rides.",
      highlights: ["Historic canal", "Urban greenspace", "Educational plaques", "Lake views"],
      image: "https://discoverhalifaxns.com/wp-content/uploads/2020/07/shubie-canal-greenway_edited-1000x0-c-default.jpg",
      icon: <Waves className="h-6 w-6" />
    },
    {
      name: "Bluff Wilderness Hiking Trail",
      difficulty: "Challenging",
      distance: "15+ km",
      type: "Natural",
      description: "For the adventurous mountain biker! Rugged wilderness trails with challenging terrain, stunning lake views, and true backcountry experience.",
      highlights: ["Wilderness experience", "Lake views", "Challenging terrain", "Wildlife spotting"],
      image: "https://novascotia.com/wp-content/uploads/2024/09/11229.webp",
      icon: <Mountain className="h-6 w-6" />
    }
  ]

  return (
    <section id="trails" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🌲 Best Cycling Trails in HRM 🌲
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover Halifax Regional Municipality's most beautiful cycling routes - from scenic waterfronts to challenging wilderness trails
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {trails.map((trail, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-64">
                <img 
                  src={trail.image} 
                  alt={trail.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2">
                  <div className="text-blue-600">{trail.icon}</div>
                  <span className="text-sm font-semibold text-gray-800">{trail.type}</span>
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {trail.distance}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{trail.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trail.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    trail.difficulty === 'Easy to Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    trail.difficulty === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trail.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{trail.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Trail Highlights:</h4>
                  <div className="flex flex-wrap gap-2">
                    {trail.highlights.map((highlight, idx) => (
                      <span 
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    💡 Perfect for our {trail.difficulty === 'Challenging' ? 'Mountain Bikes' : 'City & Hybrid Bikes'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Trail Tips & Safety</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Before You Go:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Check weather conditions</li>
                  <li>• Bring water and snacks</li>
                  <li>• Wear appropriate clothing</li>
                  <li>• Tell someone your route</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Safety First:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Always wear a helmet (included)</li>
                  <li>• Follow trail etiquette</li>
                  <li>• Stay on marked paths</li>
                  <li>• Respect wildlife and nature</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                📞 Need trail recommendations? Call us at (902) 414-5894 - we know all the best routes!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrailsSection