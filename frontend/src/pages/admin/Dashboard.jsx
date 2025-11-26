import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Users, ShoppingBag, DollarSign, Package, Star, TrendingUp, ArrowRight, Settings } from 'lucide-react'
import { StatCard } from '../../components/ui/stat-card'
import { ModernCard } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function AdminDashboard() {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernCard className="max-w-md">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </ModernCard>
      </div>
    )
  }

  const completionRate = analytics.orders.total > 0
    ? ((analytics.orders.completed / analytics.orders.total) * 100).toFixed(1)
    : 0

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.users.total,
      icon: Users,
      color: 'bg-blue-500',
      description: `${analytics.users.customers} customers, ${analytics.users.restaurants} restaurants`
    },
    {
      title: 'Total Restaurants',
      value: analytics.restaurants.total,
      icon: ShoppingBag,
      color: 'bg-green-500',
      description: `${analytics.restaurants.active} active, ${analytics.restaurants.inactive} inactive`
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.orders.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      description: `Avg: ₹${analytics.orders.averageOrderValue.toFixed(2)} per order`
    },
    {
      title: 'Total Orders',
      value: analytics.orders.total,
      icon: Package,
      color: 'bg-purple-500',
      description: `${analytics.orders.completed} completed, ${analytics.orders.cancelled} cancelled`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and analytics</p>
        </motion.div>

        {/* Date Range Filter */}
        <ModernCard className="mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </ModernCard>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>

        {/* Detailed Stats and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Platform Statistics */}
          <ModernCard>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-gray-700 font-medium">Average Rating</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {analytics.reviews.averageRating.toFixed(1)}/5
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">Total Reviews</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{analytics.reviews.total}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 font-medium">Completion Rate</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{completionRate}%</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Quick Actions */}
          <ModernCard>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild className="h-auto py-4 flex-col items-center gap-2">
                  <Link to="/admin/users">
                    <Users size={20} />
                    <span>Manage Users</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col items-center gap-2">
                  <Link to="/admin/restaurants">
                    <ShoppingBag size={20} />
                    <span>Restaurants</span>
                  </Link>
                </Button>
                <Button asChild className="h-auto py-4 flex-col items-center gap-2 col-span-2">
                  <Link to="/restaurant/create">
                    <Settings size={20} />
                    <span>Create Restaurant</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col items-center gap-2">
                  <Link to="/admin/orders">
                    <Package size={20} />
                    <span>View Orders</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col items-center gap-2">
                  <Link to="/admin/analytics">
                    <TrendingUp size={20} />
                    <span>Analytics</span>
                  </Link>
                </Button>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Recent Orders */}
        {analytics.recentOrders && analytics.recentOrders.length > 0 && (
          <ModernCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest platform orders</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Restaurant</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">{order._id.slice(-8)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{order.userId?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{order.restaurantId?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ModernCard>
        )}
      </div>
    </div>
  )
}
