import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi'

export default function AdminAnalytics() {
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
      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate

      const response = await api.get('/admin/analytics', { params })
      setAnalytics(response.data.data.analytics)
    } catch (error) {
      toast.error('Failed to load analytics')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!analytics) {
    return <div className="text-center py-12">No analytics data available</div>
  }

  const completionRate = analytics.orders.total > 0
    ? ((analytics.orders.completed / analytics.orders.total) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Platform Analytics</h1>

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm">Total Users</h3>
              <FiUsers className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{analytics.users.total}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{analytics.users.customers} customers</p>
              <p>{analytics.users.restaurants} restaurants</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm">Total Restaurants</h3>
              <FiShoppingBag className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{analytics.restaurants.total}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{analytics.restaurants.active} active</p>
              <p>{analytics.restaurants.inactive} inactive</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm">Total Revenue</h3>
              <FiDollarSign className="text-yellow-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              ₹{analytics.orders.totalRevenue.toFixed(2)}
            </p>
            <div className="mt-2 text-sm text-gray-600">
              <p>Avg: ₹{analytics.orders.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm">Total Orders</h3>
              <FiPackage className="text-purple-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{analytics.orders.total}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{analytics.orders.completed} completed</p>
              <p>{analytics.orders.cancelled} cancelled</p>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Order Statistics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold">₹{analytics.orders.averageOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cancellation Rate</span>
                <span className="font-semibold">
                  {analytics.orders.total > 0
                    ? ((analytics.orders.cancelled / analytics.orders.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Review Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reviews</span>
                <span className="font-semibold">{analytics.reviews.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold flex items-center gap-1">
                  ⭐ {analytics.reviews.averageRating.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Platform Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Active Restaurants</span>
                <FiTrendingUp className="text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {analytics.restaurants.active}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.restaurants.total > 0
                  ? ((analytics.restaurants.active / analytics.restaurants.total) * 100).toFixed(1)
                  : 0}% of total
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Active Users</span>
                <FiUsers className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{analytics.users.total}</p>
              <p className="text-sm text-gray-500 mt-1">Total registered users</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Order Success Rate</span>
                <FiTrendingUp className="text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.orders.completed} of {analytics.orders.total} orders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
