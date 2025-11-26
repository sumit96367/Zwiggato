import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Star, Clock, MapPin, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { MenuItemCard } from '../components/ui/menu-item-card'
import { ModernCard } from '../components/ui/modern-card'
import { Badge } from '../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '../components/ui/skeleton'

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviews, setShowReviews] = useState(false)
  const { addToCart, cart } = useCart()

  useEffect(() => {
    loadRestaurant()
    loadMenu()
    loadReviews()
  }, [id])

  const loadRestaurant = async () => {
    try {
      const response = await api.get(`/restaurants/${id}`)
      setRestaurant(response.data.data.restaurant)
    } catch (error) {
      toast.error('Failed to load restaurant')
    }
  }

  const loadMenu = async () => {
    try {
      const response = await api.get(`/restaurants/${id}/menu`)
      setMenuItems(response.data.data.menuItems)
    } catch (error) {
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/restaurant/${id}`)
      setReviews(response.data.data.reviews || [])
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  const handleAddToCart = (item) => {
    if (!item.isAvailable) {
      toast.error('Item is not available')
      return
    }
    addToCart({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    }, id)
    toast.success('Added to cart!')
  }

  const handleRemoveFromCart = (item) => {
    addToCart({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: -1,
      image: item.image
    }, id)
  }

  const getItemQuantity = (menuItemId) => {
    const cartItem = cart.find(item => item.menuItemId === menuItemId)
    return cartItem ? cartItem.quantity : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-6 rounded-2xl" />
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernCard className="max-w-md">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <p className="text-gray-600">Restaurant not found</p>
          </div>
        </ModernCard>
      </div>
    )
  }

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="h-80 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
          {restaurant.coverImage ? (
            <img
              src={restaurant.coverImage}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🍽️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <ModernCard>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{restaurant.name}</h1>
                  {restaurant.description && (
                    <p className="text-gray-600 mb-4 max-w-2xl">{restaurant.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 font-semibold text-gray-900">{restaurant.rating.toFixed(1)}</span>
                        <span className="ml-1 text-sm text-gray-600">({restaurant.totalReviews || 0})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>{restaurant.deliveryTime} min delivery</span>
                    </div>
                    {restaurant.location?.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>{restaurant.location.city}</span>
                      </div>
                    )}
                  </div>

                  {restaurant.cuisineType && restaurant.cuisineType.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisineType.map((cuisine, idx) => (
                        <Badge key={idx} variant="info" className="text-sm">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Menu Items */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Menu</h2>
            <p className="text-gray-600">Explore our delicious offerings</p>
          </motion.div>

          {Object.keys(menuByCategory).length === 0 ? (
            <ModernCard>
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-500 font-medium">No menu items available</p>
              </div>
            </ModernCard>
          ) : (
            Object.entries(menuByCategory).map(([category, items], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-12"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-8 bg-primary-500 rounded-full"></span>
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item, index) => {
                    const quantity = getItemQuantity(item._id)
                    return (
                      <MenuItemCard
                        key={item._id}
                        item={item}
                        quantity={quantity}
                        onAdd={() => handleAddToCart(item)}
                        onRemove={() => handleRemoveFromCart(item)}
                        index={index}
                      />
                    )
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Reviews Section */}
        <ModernCard>
          <div className="p-6">
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center justify-between w-full mb-4"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <Badge variant="default">{reviews.length}</Badge>
              </div>
              {showReviews ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {showReviews && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">⭐</div>
                        <p className="text-gray-500 font-medium">No reviews yet</p>
                        <p className="text-gray-400 text-sm mt-1">Be the first to review!</p>
                      </div>
                    ) : (
                      reviews.map((review, index) => (
                        <motion.div
                          key={review._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">{review.userId?.name || 'Anonymous'}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={
                                    star <= review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                          )}
                          {(review.foodRating || review.deliveryRating) && (
                            <div className="flex gap-4 text-sm">
                              {review.foodRating && (
                                <span className="text-gray-600">
                                  Food: <span className="font-semibold">{review.foodRating}/5</span>
                                </span>
                              )}
                              {review.deliveryRating && (
                                <span className="text-gray-600">
                                  Delivery: <span className="font-semibold">{review.deliveryRating}/5</span>
                                </span>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ModernCard>
      </div>
    </div>
  )
}
