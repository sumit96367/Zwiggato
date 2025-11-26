import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Tag, Check, Plus, X, MapPin, CreditCard, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import { ModernCard } from '../components/ui/modern-card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

export default function CheckoutPage() {
  const { cart, restaurantId, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    label: 'Home',
    isDefault: true
  })
  const [addingAddress, setAddingAddress] = useState(false)

  useEffect(() => {
    loadAddresses()
  }, [user])

  const loadAddresses = async () => {
    try {
      const response = await api.get('/users/profile')
      if (response.data.data.user.addresses) {
        setAddresses(response.data.data.user.addresses)
        const defaultAddress = response.data.data.user.addresses.find(addr => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id)
        } else if (response.data.data.user.addresses.length > 0) {
          setSelectedAddress(response.data.data.user.addresses[0]._id)
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddingAddress(true)
    try {
      const response = await api.post('/users/address', newAddress)
      toast.success('Address added successfully!')
      setShowAddAddress(false)
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        label: 'Home',
        isDefault: true
      })
      await loadAddresses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address')
    } finally {
      setAddingAddress(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setValidatingCoupon(true)
    try {
      const subtotal = getCartTotal()
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: subtotal,
        restaurantId
      })

      if (response.data.success) {
        setAppliedCoupon(response.data.data.coupon)
        setDiscount(response.data.data.discount)
        toast.success('Coupon applied successfully!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      toast.error('Please add a delivery address')
      setShowAddAddress(true)
      return
    }

    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setLoading(true)
    try {
      const address = addresses.find(addr => addr._id === selectedAddress)
      if (!address) {
        toast.error('Please select a valid address')
        setLoading(false)
        return
      }
      const subtotal = getCartTotal()
      const deliveryCharges = 30
      const tax = subtotal * 0.18

      const orderData = {
        restaurantId,
        orderItems: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        deliveryAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country || 'India'
        },
        paymentMethod,
        specialInstructions: '',
        couponCode: appliedCoupon?.code || null,
        discount: discount
      }

      const response = await api.post('/orders', orderData)
      toast.success('Order placed successfully!')
      clearCart()
      navigate(`/orders/${response.data.data.order._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getCartTotal()
  const deliveryCharges = 30
  const tax = subtotal * 0.18
  const total = subtotal + deliveryCharges + tax - discount

  const paymentMethods = [
    { value: 'COD', label: 'Cash on Delivery', icon: '💵' },
    { value: 'Card', label: 'Credit/Debit Card', icon: '💳' },
    { value: 'UPI', label: 'UPI', icon: '📱' },
    { value: 'Wallet', label: 'Digital Wallet', icon: '👛' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete the purchase</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coupon Code */}
            <ModernCard>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Apply Coupon</h2>
                </div>
                {!appliedCoupon ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                    >
                      {validatingCoupon ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={16} />
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Delivery Address */}
            <ModernCard>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                  </div>
                  {!showAddAddress && addresses.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddAddress(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Address
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {showAddAddress && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddAddress}
                      className="mb-6 p-5 border-2 border-primary-200 rounded-xl bg-primary-50 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Add New Address</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddAddress(false)
                            setNewAddress({
                              street: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              country: 'India',
                              label: 'Home',
                              isDefault: true
                            })
                          }}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label (e.g., Home, Office)
                          </label>
                          <input
                            type="text"
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                          <input
                            type="text"
                            value={newAddress.zipCode}
                            onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                            className="rounded"
                          />
                          <label htmlFor="isDefault" className="text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={addingAddress}
                            className="flex-1"
                          >
                            {addingAddress ? (
                              <>
                                <Loader2 className="mr-2 animate-spin" size={16} />
                                Adding...
                              </>
                            ) : (
                              'Add Address'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddAddress(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {addresses.length === 0 && !showAddAddress && (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4 font-medium">No addresses saved</p>
                    <Button onClick={() => setShowAddAddress(true)}>
                      <Plus size={16} className="mr-2" />
                      Add Address
                    </Button>
                  </div>
                )}

                {addresses.length > 0 && !showAddAddress && (
                  <div className="space-y-3">
                    {addresses.map((address, index) => (
                      <motion.label
                        key={address._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedAddress === address._id
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address._id}
                            checked={selectedAddress === address._id}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{address.label}</p>
                              {address.isDefault && (
                                <Badge variant="info" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.street}, {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                )}
              </div>
            </ModernCard>

            {/* Payment Method */}
            <ModernCard>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method, index) => (
                    <motion.label
                      key={method.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold text-gray-900">{method.label}</span>
                    </motion.label>
                  ))}
                </div>
              </div>
            </ModernCard>
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
                      <span>Subtotal</span>
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
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading || (addresses.length > 0 && !selectedAddress) || cart.length === 0}
                    size="lg"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Placing Order...
                      </>
                    ) : addresses.length === 0 ? (
                      'Add Address to Continue'
                    ) : !selectedAddress ? (
                      'Select Address'
                    ) : (
                      <>
                        Place Order
                        <ArrowRight className="ml-2" size={20} />
                      </>
                    )}
                  </Button>

                  {addresses.length === 0 && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Please add a delivery address to place your order
                    </p>
                  )}
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
