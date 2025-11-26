import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { RotateCw, Package, ArrowRight, Filter } from 'lucide-react'
import { ModernCard } from '../components/ui/modern-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import { Skeleton } from '../components/ui/skeleton'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = statusFilter ? { status: statusFilter } : {}
      const response = await api.get('/users/orders', { params })
      setOrders(response.data.data.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
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

  const handleReorder = async (e, orderId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const response = await api.post(`/orders/${orderId}/reorder`)
      toast.success('Order reordered successfully!')
      navigate(`/orders/${response.data.data.order._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reorder')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-600">View your order history</p>
        </motion.div>

        {/* Filter */}
        <ModernCard className="mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by Status</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Orders</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Restaurant Accepted">Restaurant Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </ModernCard>

        {orders.length === 0 ? (
          <ModernCard>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-500 font-medium text-lg mb-2">No orders yet</p>
              <p className="text-gray-400 text-sm mb-6">Start ordering from your favorite restaurants</p>
              <Button asChild size="lg">
                <Link to="/restaurants">
                  Browse Restaurants
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
            </div>
          </ModernCard>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/orders/${order._id}`}>
                  <ModernCard className="hover:shadow-lg transition-all duration-300">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {order.restaurantId?.name || 'Restaurant'}
                            </h3>
                            <Badge variant={getStatusColor(order.orderStatus)}>
                              {order.orderStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Order #{order._id.slice(-8)} • {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <p className="text-2xl font-bold text-primary-600">
                            ₹{order.totalAmount.toFixed(2)}
                          </p>
                          {order.orderStatus === 'Delivered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleReorder(e, order._id)}
                              className="w-full md:w-auto"
                            >
                              <RotateCw size={16} className="mr-1" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
