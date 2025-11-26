import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Search, Filter, Package, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { Skeleton } from '../../components/ui/skeleton'
import { format } from 'date-fns'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    loadOrders()
  }, [pagination.page, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (statusFilter) params.status = statusFilter

      const response = await api.get('/admin/orders', { params })
      setOrders(response.data.data.orders)
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }))
    } catch (error) {
      toast.error('Failed to load orders')
      console.error(error)
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
            <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
          </div>
          <p className="text-gray-600">View and manage all platform orders</p>
        </motion.div>

        {/* Filters */}
        <ModernCard className="mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by Status</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
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

        {/* Orders Table */}
        <ModernCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Restaurant</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="text-sm font-mono text-gray-600">#{order._id.slice(-8)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{order.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.userId?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-900">{order.restaurantId?.name || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/orders/${order._id}`}>
                          <ExternalLink size={16} className="mr-1" />
                          View
                        </Link>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </ModernCard>
      </div>
    </div>
  )
}
