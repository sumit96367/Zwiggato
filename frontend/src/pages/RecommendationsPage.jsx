import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { FiStar, FiClock, FiTrendingUp } from 'react-icons/fi'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
    loadTrending()
  }, [])

  const loadRecommendations = async () => {
    try {
      const response = await api.get('/recommendations')
      setRecommendations(response.data.data.recommendations)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrending = async () => {
    try {
      const response = await api.get('/recommendations/trending')
      setTrending(response.data.data.restaurants)
    } catch (error) {
      console.error('Failed to load trending:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">For You</h1>

      {/* Personalized Recommendations */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        {recommendations.length === 0 ? (
          <p className="text-gray-500">Start ordering to get personalized recommendations!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(restaurant => (
              <Link
                key={restaurant._id}
                to={`/restaurants/${restaurant._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {restaurant.coverImage ? (
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiStar className="text-yellow-500 mr-1" />
                      <span>{restaurant.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      <span>{restaurant.deliveryTime} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Restaurants */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <FiTrendingUp className="mr-2" />
          Trending Now
        </h2>
        {trending.length === 0 ? (
          <p className="text-gray-500">No trending restaurants at the moment</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map(restaurant => (
              <Link
                key={restaurant._id}
                to={`/restaurants/${restaurant._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {restaurant.coverImage ? (
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiStar className="text-yellow-500 mr-1" />
                      <span>{restaurant.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      <span>{restaurant.deliveryTime} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

