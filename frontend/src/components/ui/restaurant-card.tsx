import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RestaurantCardProps {
  restaurant: {
    _id: string
    name: string
    rating: number
    deliveryTime: number
    cuisineType?: string[]
    coverImage?: string
    location?: {
      city?: string
    }
  }
  index?: number
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link
        to={`/restaurants/${restaurant._id}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
            {restaurant.coverImage ? (
              <img
                src={restaurant.coverImage}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Rating Badge */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {restaurant.name}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTime} min</span>
              </div>
              {restaurant.location?.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.location.city}</span>
                </div>
              )}
            </div>

            {/* Cuisine Tags */}
            {restaurant.cuisineType && restaurant.cuisineType.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisineType.slice(0, 3).map((cuisine, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

