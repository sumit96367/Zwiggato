import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { ModernCard } from '../../components/ui/modern-card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'
import { Skeleton } from '../../components/ui/skeleton'
import { format } from 'date-fns'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    loadUsers()
  }, [pagination.page, search, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const response = await api.get('/admin/users', { params })
      setUsers(response.data.data.users)
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }))
    } catch (error) {
      toast.error('Failed to load users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      })
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      loadUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const roleBadgeVariants = {
    admin: 'error',
    restaurant: 'info',
    customer: 'success'
  }

  if (loading && users.length === 0) {
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
            <Users className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
          </div>
          <p className="text-gray-600">Manage platform users and their access</p>
        </motion.div>

        {/* Filters */}
        <ModernCard className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px]"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </ModernCard>

        {/* Users Table */}
        <ModernCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{user.phone || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={roleBadgeVariants[user.role] || 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={user.isActive ? 'success' : 'error'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusToggle(user._id, user.isActive)}
                        className={user.isActive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                      >
                        {user.isActive ? (
                          <>
                            <UserX size={16} className="mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} className="mr-1" />
                            Activate
                          </>
                        )}
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
                {pagination.total} users
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
