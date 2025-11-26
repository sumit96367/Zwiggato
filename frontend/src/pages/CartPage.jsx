import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { ModernCard } from '../components/ui/modern-card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { motion } from 'framer-motion'

export default function CartPage() {
  const { cart, restaurantId, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ModernCard className="max-w-md mx-4">
          <div className="p-12 text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add delicious items from restaurants to get started</p>
            <Button asChild size="lg">
              <Link to="/restaurants">
                Browse Restaurants
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </Button>
          </div>
        </ModernCard>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const deliveryCharges = 30
  const tax = subtotal * 0.18
  const total = subtotal + deliveryCharges + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.menuItemId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ModernCard>
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Image */}
                      {item.image ? (
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-3xl">🍽️</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-lg font-semibold text-primary-600">₹{item.price.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            className="h-9 w-9 p-0 rounded-full"
                          >
                            <Minus size={16} />
                          </Button>
                          <div className="flex items-center gap-2 min-w-[60px] justify-center">
                            <span className="font-semibold text-gray-900 text-lg">{item.quantity}</span>
                            <Badge variant="default" className="text-xs">
                              × ₹{item.price.toFixed(2)}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="h-9 w-9 p-0 rounded-full"
                          >
                            <Plus size={16} />
                          </Button>
                          <div className="ml-auto">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <div className="pt-4">
              <Button
                variant="ghost"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={18} className="mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ModernCard>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charges</span>
                      <span className="font-medium">₹{deliveryCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (18% GST)</span>
                      <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild size="lg" className="w-full">
                    <Link to="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2" size={20} />
                    </Link>
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    You won't be charged until you confirm your order
                  </p>
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
