import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, X, Clock, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '../../components/ui/skeleton'
import { cn } from '../../lib/utils'

const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Salad', 'Soup', 'Snack']
const dietaryTags = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Spicy', 'Healthy']

export default function RestaurantMenuManagement() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    dietaryTags: [],
    preparationTime: '',
    isAvailable: true,
    image: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      const restaurantResponse = await api.get('/restaurants/my-restaurant')
      const restaurant = restaurantResponse.data.data.restaurant
      
      if (!restaurant) {
        toast.error('No restaurant associated with your account. Please create a restaurant first.')
        setLoading(false)
        return
      }

      const menuResponse = await api.get(`/restaurants/${restaurant._id}/menu`)
      setMenuItems(menuResponse.data.data.menuItems)
    } catch (error) {
      if (error.response?.status === 404) {
        setMenuItems([])
        toast.error('No restaurant associated with your account. Please create a restaurant first.')
      } else {
        toast.error('Failed to load menu items')
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const restaurantResponse = await api.get('/restaurants/my-restaurant')
      const restaurant = restaurantResponse.data.data.restaurant
      
      if (!restaurant) {
        toast.error('No restaurant associated with your account')
        setSubmitting(false)
        return
      }

      const payload = {
        ...formData,
        restaurantId: restaurant._id,
        price: parseFloat(formData.price),
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : 15
      }
      
      if (payload.preparationTime < 5) {
        payload.preparationTime = 15
      }

      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, payload)
        toast.success('Menu item updated successfully')
      } else {
        await api.post('/menu', payload)
        toast.success('Menu item added successfully')
      }

      setShowModal(false)
      resetForm()
      loadMenuItems()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save menu item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      dietaryTags: item.dietaryTags || [],
      preparationTime: item.preparationTime?.toString() || '',
      isAvailable: item.isAvailable,
      image: item.image || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return
    }

    try {
      await api.delete(`/menu/${itemId}`)
      toast.success('Menu item deleted successfully')
      loadMenuItems()
    } catch (error) {
      toast.error('Failed to delete menu item')
    }
  }

  const handleToggleAvailability = async (item) => {
    try {
      await api.put(`/menu/${item._id}`, {
        ...item,
        isAvailable: !item.isAvailable
      })
      toast.success(`Item ${!item.isAvailable ? 'enabled' : 'disabled'}`)
      loadMenuItems()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      dietaryTags: [],
      preparationTime: '',
      isAvailable: true,
      image: ''
    })
    setEditingItem(null)
  }

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
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
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Menu Management</h1>
            <p className="text-gray-600">Manage your restaurant menu items</p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            size="lg"
          >
            <Plus size={20} className="mr-2" />
            Add Menu Item
          </Button>
        </motion.div>

        {menuItems.length === 0 ? (
          <ModernCard>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500 font-medium text-lg mb-2">No menu items yet</p>
              <p className="text-gray-400 text-sm mb-6">Start by adding your first menu item</p>
              <Button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
              >
                <Plus size={18} className="mr-2" />
                Add Your First Menu Item
              </Button>
            </div>
          </ModernCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ModernCard className="overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-primary-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant={item.isAvailable ? 'success' : 'error'}>
                        {item.isAvailable ? (
                          <>
                            <CheckCircle2 size={12} className="mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="mr-1" />
                            Unavailable
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-primary-600">₹{item.price.toFixed(2)}</span>
                      {item.preparationTime && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock size={14} />
                          <span>{item.preparationTime} min</span>
                        </div>
                      )}
                    </div>

                    {item.dietaryTags && item.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.dietaryTags.map(tag => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAvailability(item)}
                        className={cn(
                          item.isAvailable ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                        )}
                      >
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                  >
                    <X size={20} />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preparation Time (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={formData.preparationTime}
                        onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Dietary Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            formData.dietaryTags.includes(tag)
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="rounded w-4 h-4"
                    />
                    <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Available for ordering
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                      size="lg"
                    >
                      {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
