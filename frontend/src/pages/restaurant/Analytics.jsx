import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiDollarSign, FiPackage, FiTrendingUp, FiUsers } from 'react-icons/fi'

export default function RestaurantAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      const restaurantResponse = await api.get('/restaurants/my-restaurant')
      const restaurant = restaurantResponse.data.data.restaurant
      
      if (!restaurant) {
        setAnalytics(null)
        setLoading(false)
        return
      }

      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate

      const response = await api.get(`/restaurants/${restaurant._id}/analytics`, { params })
      setAnalytics(response.data.data.analytics)
    } catch (error) {
      if (error.response?.status === 404) {
        // No restaurant found - this is expected for new restaurant owners
        setAnalytics(null)
      } else {
        toast.error('Failed to load analytics')
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Restaurant Analytics</h1>

        {/* Date Range Filter */}
        <div className="card p-4 mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input-field"
              />
            </div>
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="btn-secondary"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-500 p-4 rounded-full text-white">
                <FiDollarSign size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{analytics.totalOrders}</p>
              </div>
              <div className="bg-blue-500 p-4 rounded-full text-white">
                <FiPackage size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average Order Value</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{analytics.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-500 p-4 rounded-full text-white">
                <FiTrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-yellow-500 p-4 rounded-full text-white">
                <FiUsers size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Order Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Orders</span>
                <span className="font-semibold">{analytics.completedOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancelled Orders</span>
                <span className="font-semibold">{analytics.cancelledOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold">{analytics.averageRating.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold">{analytics.totalReviews}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Popular Dishes</h2>
            {analytics.popularDishes && analytics.popularDishes.length > 0 ? (
              <div className="space-y-2">
                {analytics.popularDishes.slice(0, 10).map((dish, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{dish.name}</span>
                    <span className="text-primary-600 font-semibold">{dish.count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No order data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
