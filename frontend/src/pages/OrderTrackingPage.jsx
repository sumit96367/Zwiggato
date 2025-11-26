import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { format } from 'date-fns'
import ReviewModal from '../components/ReviewModal'
import { ModernCard } from '../components/ui/modern-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import { Skeleton } from '../components/ui/skeleton'
import { Package, MapPin, CreditCard, Star, CheckCircle2, Clock, Truck, Loader2 } from 'lucide-react'

const statusSteps = [
  { name: 'Order Placed', icon: Clock },
  { name: 'Restaurant Accepted', icon: CheckCircle2 },
  { name: 'Preparing', icon: Loader2 },
  { name: 'Ready for Pickup', icon: Package },
  { name: 'Out for Delivery', icon: Truck },
  { name: 'Delivered', icon: CheckCircle2 }
]

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [id])

  const loadOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data.data.order)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernCard className="max-w-md">
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600 font-medium">Order not found</p>
          </div>
        </ModernCard>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex(step => step.name === order.orderStatus)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600">Track your order in real-time</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <ModernCard>
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Order #{order._id.slice(-8)}
                    </h2>
                    <p className="text-gray-600">
                      Placed on {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-3xl font-bold text-primary-600 mb-1">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <Badge variant={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="relative py-6">
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-primary-500"
                    />
                  </div>
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      const isActive = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex

                      return (
                        <motion.div
                          key={step.name}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={`
                              w-16 h-16 rounded-full flex items-center justify-center
                              transition-all duration-300
                              ${isActive
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                                : 'bg-gray-200 text-gray-400'
                              }
                              ${isCurrent ? 'ring-4 ring-primary-200' : ''}
                            `}
                          >
                            <Icon size={24} className={isCurrent ? 'animate-pulse' : ''} />
                          </div>
                          <p
                            className={`text-xs mt-3 text-center font-medium max-w-[100px] ${
                              isActive ? 'text-primary-600' : 'text-gray-500'
                            }`}
                          >
                            {step.name}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Order Items */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.orderItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Delivery Address */}
            <ModernCard>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Delivery Address
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </p>
              </div>
            </ModernCard>

            {/* Review Button for Delivered Orders */}
            {order.orderStatus === 'Delivered' && (
              <ModernCard>
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">⭐</div>
                  <p className="text-gray-600 mb-4">How was your experience?</p>
                  <Button
                    onClick={() => setShowReviewModal(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Star className="mr-2" size={20} />
                    Rate Your Experience
                  </Button>
                </div>
              </ModernCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Payment Info */}
              <ModernCard>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order Total</span>
                      <span className="font-bold text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Restaurant Info */}
              {order.restaurantId && (
                <ModernCard>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant</h3>
                    <p className="font-semibold text-gray-900 mb-1">
                      {order.restaurantId.name || 'Restaurant'}
                    </p>
                    {order.restaurantId.location?.city && (
                      <p className="text-sm text-gray-600">{order.restaurantId.location.city}</p>
                    )}
                  </div>
                </ModernCard>
              )}
            </div>
          </div>
        </div>

        {showReviewModal && order && (
          <ReviewModal
            order={order}
            restaurantId={order.restaurantId._id || order.restaurantId}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => loadOrder()}
          />
        )}
      </div>
    </div>
  )
}
