import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

const cuisineTypes = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American',
  'Continental', 'Fast Food', 'Desserts', 'Beverages', 'Pizza', 'Cafe',
  'Seafood', 'Mediterranean', 'BBQ', 'Vegetarian', 'Vegan'
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function CreateRestaurant() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [restaurantOwners, setRestaurantOwners] = useState([])
  const [selectedOwnerId, setSelectedOwnerId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: [],
    deliveryTime: 30,
    minimumOrder: 0,
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    operatingHours: days.map(day => ({
      day,
      openTime: '11:00',
      closeTime: '22:00',
      isOpen: true
    }))
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // If admin, load restaurant owners list
    if (user?.role === 'admin') {
      loadRestaurantOwners()
    }
  }, [user])

  const loadRestaurantOwners = async () => {
    try {
      const response = await api.get('/admin/users', { params: { role: 'restaurant', limit: 100 } })
      setRestaurantOwners(response.data.data.users)
    } catch (error) {
      console.error('Failed to load restaurant owners:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCuisineToggle = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter(c => c !== cuisine)
        : [...prev.cuisineType, cuisine]
    }))
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: prev.operatingHours.map(oh =>
        oh.day === day ? { ...oh, [field]: value } : oh
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = { ...formData }
      // If admin and owner selected, add ownerId
      if (user?.role === 'admin' && selectedOwnerId) {
        payload.ownerId = selectedOwnerId
      }

      const response = await api.post('/restaurants', payload)
      toast.success('Restaurant created successfully!')
      
      // Navigate based on user role
      if (user?.role === 'admin') {
        navigate('/admin/restaurants')
      } else {
        navigate('/restaurant/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create restaurant')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {user?.role === 'admin' ? 'Create Restaurant' : 'Create Your Restaurant'}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="card p-6 space-y-6">
            {/* Owner Selection (Admin Only) */}
            {user?.role === 'admin' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Restaurant Owner</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Restaurant Owner *
                  </label>
                  <select
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a restaurant owner</option>
                    {restaurantOwners.map(owner => (
                      <option key={owner._id} value={owner._id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the user who will own this restaurant. If the user doesn't exist, create them first in User Management.
                  </p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Time (minutes) *
                    </label>
                    <input
                      type="number"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      className="input-field"
                      min="15"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order (₹) *
                    </label>
                    <input
                      type="number"
                      name="minimumOrder"
                      value={formData.minimumOrder}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cuisine Type */}
            <div>
              <h2 className="text-xl font-bold mb-4">Cuisine Type</h2>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map(cuisine => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => handleCuisineToggle(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      formData.cuisineType.includes(cuisine)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h2 className="text-xl font-bold mb-4">Operating Hours</h2>
              <div className="space-y-2">
                {formData.operatingHours.map(oh => (
                  <div key={oh.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24 font-semibold">{oh.day}</div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={oh.isOpen}
                        onChange={(e) => handleOperatingHoursChange(oh.day, 'isOpen', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Open</span>
                    </label>
                    {oh.isOpen && (
                      <>
                        <input
                          type="time"
                          value={oh.openTime}
                          onChange={(e) => handleOperatingHoursChange(oh.day, 'openTime', e.target.value)}
                          className="input-field w-32"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={oh.closeTime}
                          onChange={(e) => handleOperatingHoursChange(oh.day, 'closeTime', e.target.value)}
                          className="input-field w-32"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || formData.cuisineType.length === 0}
                className="btn-primary flex-1"
              >
                {submitting ? 'Creating...' : 'Create Restaurant'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (user?.role === 'admin') {
                    navigate('/admin/restaurants')
                  } else {
                    navigate('/restaurant/dashboard')
                  }
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

