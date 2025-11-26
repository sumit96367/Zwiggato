import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    label: 'Home',
    isDefault: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      })
      loadAddresses()
    }
  }, [user])

  const loadAddresses = async () => {
    try {
      const response = await api.get('/users/profile')
      setAddresses(response.data.data.user.addresses || [])
    } catch (error) {
      console.error('Failed to load addresses:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await updateProfile(formData)
    setLoading(false)
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await api.post('/users/address', newAddress)
      toast.success('Address added successfully!')
      setShowAddAddress(false)
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        label: 'Home',
        isDefault: false
      })
      loadAddresses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address')
    }
  }

  const handleEditAddress = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/users/address/${editingAddress._id}`, newAddress)
      toast.success('Address updated successfully!')
      setEditingAddress(null)
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        label: 'Home',
        isDefault: false
      })
      loadAddresses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return
    }
    try {
      await api.delete(`/users/address/${addressId}`)
      toast.success('Address deleted successfully!')
      loadAddresses()
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  const startEdit = (address) => {
    setEditingAddress(address)
    setNewAddress({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'India',
      label: address.label || 'Home',
      isDefault: address.isDefault || false
    })
    setShowAddAddress(true)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Delivery Addresses</h2>
            {!showAddAddress && (
              <button
                onClick={() => {
                  setShowAddAddress(true)
                  setEditingAddress(null)
                  setNewAddress({
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'India',
                    label: 'Home',
                    isDefault: false
                  })
                }}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <FiPlus />
                Add Address
              </button>
            )}
          </div>

          {showAddAddress && (
            <form
              onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
              className="mb-4 p-4 border-2 border-primary-200 rounded-lg bg-primary-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAddress(false)
                    setEditingAddress(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    className="input-field"
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
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAddress(false)
                      setEditingAddress(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No addresses saved</p>
            ) : (
              addresses.map(address => (
                <div
                  key={address._id}
                  className="p-4 border-2 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold">{address.label}</p>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(address)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
