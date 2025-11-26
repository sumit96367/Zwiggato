import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Search, Filter, X } from 'lucide-react'
import { RestaurantCard } from '../components/ui/restaurant-card'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    cuisineType: '',
    minRating: '',
    maxDeliveryTime: ''
  })

  useEffect(() => {
    loadRestaurants()
  }, [filters])

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.cuisineType) params.cuisineType = filters.cuisineType
      if (filters.minRating) params.minRating = filters.minRating
      if (filters.maxDeliveryTime) params.maxDeliveryTime = filters.maxDeliveryTime

      const response = await api.get('/restaurants', { params })
      setRestaurants(response.data.data.restaurants)
    } catch (error) {
      console.error('Failed to load restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      cuisineType: '',
      minRating: '',
      maxDeliveryTime: ''
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Restaurants</h1>
          <p className="text-gray-600">Explore our curated selection of restaurants</p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter size={18} className="mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
                    <select
                      value={filters.cuisineType}
                      onChange={(e) => handleFilterChange('cuisineType', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Cuisines</option>
                      <option value="Indian">Indian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Italian">Italian</option>
                      <option value="Mexican">Mexican</option>
                      <option value="Thai">Thai</option>
                      <option value="Japanese">Japanese</option>
                      <option value="American">American</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Any Rating</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                      <option value="3">3+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Delivery Time</label>
                    <select
                      value={filters.maxDeliveryTime}
                      onChange={(e) => handleFilterChange('maxDeliveryTime', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Any Time</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-600"
                    >
                      <X size={16} className="mr-2" />
                      Clear all filters
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.cuisineType && (
              <Badge variant="info">
                Cuisine: {filters.cuisineType}
                <button
                  onClick={() => handleFilterChange('cuisineType', '')}
                  className="ml-2 hover:text-blue-600"
                >
                  <X size={14} />
                </button>
              </Badge>
            )}
            {filters.minRating && (
              <Badge variant="warning">
                Rating: {filters.minRating}+
                <button
                  onClick={() => handleFilterChange('minRating', '')}
                  className="ml-2 hover:text-yellow-600"
                >
                  <X size={14} />
                </button>
              </Badge>
            )}
            {filters.maxDeliveryTime && (
              <Badge variant="success">
                Max Time: {filters.maxDeliveryTime}min
                <button
                  onClick={() => handleFilterChange('maxDeliveryTime', '')}
                  className="ml-2 hover:text-green-600"
                >
                  <X size={14} />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{restaurants.length}</span> restaurant{restaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium mb-2">No restaurants found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
