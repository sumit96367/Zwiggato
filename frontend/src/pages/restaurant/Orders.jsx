import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Check, X, Clock, Package, Truck, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '../../components/ui/skeleton'
import { cn } from '../../lib/utils'

const statusOptions = {
  'Order Placed': ['Restaurant Accepted', 'Rejected'],
  'Restaurant Accepted': ['Preparing', 'Cancelled'],
  'Preparing': ['Ready for Pickup'],
  'Ready for Pickup': ['Out for Delivery'],
  'Out for Delivery': ['Delivered']
}

const statusIcons = {
  'Order Placed': Clock,
  'Restaurant Accepted': Check,
  'Preparing': Package,
  'Ready for Pickup': Package,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle,
  'Rejected': X,
  'Cancelled': X
}

const statusColors = {
  'Order Placed': 'warning',
  'Restaurant Accepted': 'info',
  'Preparing': 'warning',
  'Ready for Pickup': 'info',
  'Out for Delivery': 'info',
  'Delivered': 'success',
  'Rejected': 'error',
  'Cancelled': 'error'
}

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [updating, setUpdating] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState(new Set())

  useEffect(() => {
    loadOrders()
  }, [filter])

  const loadOrders = async () => {
    try {
      const restaurantResponse = await api.get('/restaurants/my-restaurant')
      const restaurant = restaurantResponse.data.data.restaurant
      
      if (!restaurant) {
        setOrders([])
        setLoading(false)
        return
      }

      const params = filter !== 'all' ? { status: filter } : {}
      const ordersResponse = await api.get(`/orders/restaurant/${restaurant._id}`, { params })
      setOrders(ordersResponse.data.data.orders)
    } catch (error) {
      if (error.response?.status === 404) {
        setOrders([])
      } else {
        toast.error('Failed to load orders')
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setUpdating(true)
    try {
      const body = { status: newStatus }
      if (newStatus === 'Rejected' && rejectionReason) {
        body.rejectionReason = rejectionReason
      }

      await api.put(`/orders/${selectedOrder._id}/status`, body)
      toast.success('Order status updated successfully')
      setShowStatusModal(false)
      setSelectedOrder(null)
      setNewStatus('')
      setRejectionReason('')
      loadOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setNewStatus('')
    setRejectionReason('')
    setShowStatusModal(true)
  }

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  const getStatusColor = (status) => {
    return statusColors[status] || 'default'
  }

  const filterTabs = [
    { value: 'all', label: 'All Orders' },
    { value: 'Order Placed', label: 'New' },
    { value: 'Restaurant Accepted', label: 'Accepted' },
    { value: 'Preparing', label: 'Preparing' },
    { value: 'Ready for Pickup', label: 'Ready' },
    { value: 'Out for Delivery', label: 'Delivery' },
    { value: 'Delivered', label: 'Delivered' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Restaurant Orders</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map(tab => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              onClick={() => setFilter(tab.value)}
              className="rounded-full"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <ModernCard>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-500 font-medium text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter === 'all' ? 'Orders will appear here when customers place them' : `No ${filter} orders`}
              </p>
            </div>
          </ModernCard>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const StatusIcon = statusIcons[order.orderStatus] || Clock
              const availableStatuses = statusOptions[order.orderStatus] || []
              const isExpanded = expandedOrders.has(order._id)

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ModernCard>
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              Order #{order._id.slice(-6)}
                            </h3>
                            <Badge variant={getStatusColor(order.orderStatus)}>
                              <StatusIcon size={14} className="mr-1" />
                              {order.orderStatus}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium">{order.userId?.name || 'Customer'}</span>
                            <span>•</span>
                            <span>{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                            <span>•</span>
                            <span>{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600 mb-1">
                              ₹{order.totalAmount.toFixed(2)}
                            </p>
                            {availableStatuses.length > 0 && (
                              <Button
                                size="sm"
                                onClick={() => openStatusModal(order)}
                                className="mt-2"
                              >
                                Update Status
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Order Items</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order._id)}
                          >
                            {isExpanded ? 'Show Less' : 'Show Details'}
                            <ChevronDown className={cn("ml-2 transition-transform", isExpanded && "rotate-180")} size={16} />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {order.orderItems.slice(0, isExpanded ? order.orderItems.length : 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {!isExpanded && order.orderItems.length > 2 && (
                            <p className="text-xs text-gray-500 text-center py-1">
                              +{order.orderItems.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-gray-200 space-y-4">
                              {/* Delivery Address */}
                              <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</p>
                                <p className="text-sm text-gray-600">
                                  {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                                </p>
                              </div>

                              {/* Special Instructions */}
                              {order.specialInstructions && (
                                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                  <p className="text-sm font-semibold text-yellow-800 mb-1">Special Instructions</p>
                                  <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {order.rejectionReason && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                  <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</p>
                                  <p className="text-sm text-red-700">{order.rejectionReason}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ModernCard>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Status Update Modal */}
        <AnimatePresence>
          {showStatusModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowStatusModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Order Status</h2>
                <p className="text-gray-600 mb-2">
                  Current Status: <span className="font-semibold">{selectedOrder.orderStatus}</span>
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select status</option>
                    {statusOptions[selectedOrder.orderStatus]?.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {newStatus === 'Rejected' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows="3"
                      placeholder="Please provide a reason for rejection"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={updating || !newStatus}
                    className="flex-1"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedOrder(null)
                      setNewStatus('')
                      setRejectionReason('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
