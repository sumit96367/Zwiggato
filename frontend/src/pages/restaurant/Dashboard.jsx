import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Package, DollarSign, Clock, CheckCircle, TrendingUp, Users, ArrowRight } from 'lucide-react'
import { StatCard } from '../../components/ui/stat-card'
import { ModernCard } from '../../components/ui/modern-card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function RestaurantDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [noRestaurant, setNoRestaurant] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const myRestaurantResponse = await api.get('/restaurants/my-restaurant')
      const myRestaurant = myRestaurantResponse.data.data.restaurant
      
      if (!myRestaurant) {
        setNoRestaurant(true)
        setLoading(false)
        return
      }

      const restaurantId = myRestaurant._id
      const ordersResponse = await api.get(`/orders/restaurant/${restaurantId}?limit=100`)
      const orders = ordersResponse.data.data.orders

      const totalOrders = orders.length
      const totalRevenue = orders
        .filter(o => o.orderStatus === 'Delivered')
        .reduce((sum, o) => sum + o.totalAmount, 0)
      const pendingOrders = orders.filter(o => 
        ['Order Placed', 'Restaurant Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(o.orderStatus)
      ).length
      const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        averageRating: myRestaurant?.rating || 0,
        totalReviews: myRestaurant?.totalReviews || 0
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      if (error.response?.status === 404) {
        setNoRestaurant(true)
      } else {
        toast.error('Failed to load dashboard data')
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'success',
      'Rejected': 'error',
      'Cancelled': 'error',
      'Order Placed': 'warning',
      'Restaurant Accepted': 'info',
      'Preparing': 'warning',
      'Ready for Pickup': 'info',
      'Out for Delivery': 'info'
    }
    return colors[status] || 'default'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (noRestaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernCard className="max-w-2xl mx-4">
          <div className="p-12 text-center">
            <div className="text-6xl mb-6">🍽️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Restaurant Found</h1>
            <p className="text-gray-600 mb-8 text-lg">
              You need to create a restaurant before you can manage menu items and orders.
            </p>
            <Button
              onClick={() => navigate('/restaurant/create')}
              size="lg"
              className="px-8"
            >
              Create Your Restaurant
            </Button>
          </div>
        </ModernCard>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-blue-500',
      description: 'All time orders'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'From completed orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-orange-500',
      description: 'Requires attention'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-purple-500',
      description: 'Successfully delivered'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: TrendingUp,
      color: 'bg-yellow-500',
      description: `${stats.totalReviews} reviews`
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: Users,
      color: 'bg-indigo-500',
      description: 'Customer feedback'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
            <p className="text-gray-600">Manage your restaurant operations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/restaurant/menu">
                Manage Menu
              </Link>
            </Button>
            <Button asChild>
              <Link to="/restaurant/orders">
                View All Orders
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Recent Orders */}
        <ModernCard>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-600 mt-1">Latest customer orders</p>
              </div>
              <Link
                to="/restaurant/orders"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</h3>
                        <Badge variant={getStatusColor(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{order.userId?.name || 'Customer'}</span>
                        <span>•</span>
                        <span>{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                        <span>•</span>
                        <span>{order.orderItems.length} item(s)</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-primary-600 mb-1">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <Link
                        to={`/restaurant/orders`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
