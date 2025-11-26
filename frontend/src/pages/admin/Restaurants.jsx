import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Search, Plus, CheckCircle2, XCircle, Star, ExternalLink, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { Skeleton } from '../../components/ui/skeleton'

export default function AdminRestaurants() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    loadRestaurants()
  }, [pagination.page, search, statusFilter])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (search) params.search = search
      if (statusFilter) params.isActive = statusFilter

      const response = await api.get('/admin/restaurants', { params })
      setRestaurants(response.data.data.restaurants)
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }))
    } catch (error) {
      toast.error('Failed to load restaurants')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (restaurantId, currentStatus) => {
    try {
      await api.put(`/admin/restaurants/${restaurantId}/status`, {
        isActive: !currentStatus
      })
      toast.success(`Restaurant ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      loadRestaurants()
    } catch (error) {
      toast.error('Failed to update restaurant status')
    }
  }

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
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
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-gray-900">Restaurant Management</h1>
            </div>
            <p className="text-gray-600">Manage all restaurants on the platform</p>
          </div>
          <Button
            onClick={() => navigate('/restaurant/create')}
            size="lg"
          >
            <Plus size={20} className="mr-2" />
            Add New Restaurant
          </Button>
        </motion.div>

        {/* Filters */}
        <ModernCard className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px]"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </ModernCard>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <ModernCard>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <p className="text-gray-500 font-medium text-lg">No restaurants found</p>
            </div>
          </ModernCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ModernCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{restaurant.name}</h3>
                        {restaurant.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {restaurant.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                          Owner: <span className="font-medium">{restaurant.ownerId?.name || 'N/A'}</span>
                        </p>
                      </div>
                      <Badge variant={restaurant.isActive ? 'success' : 'error'}>
                        {restaurant.isActive ? (
                          <>
                            <CheckCircle2 size={12} className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {restaurant.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({restaurant.totalReviews || 0})
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to={`/restaurants/${restaurant._id}`}>
                          <ExternalLink size={16} className="mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(restaurant._id, restaurant.isActive)}
                        className={restaurant.isActive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                      >
                        {restaurant.isActive ? (
                          <>
                            <XCircle size={16} className="mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <ModernCard>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} restaurants
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
          </ModernCard>
        )}
      </div>
    </div>
  )
}
