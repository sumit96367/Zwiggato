import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi'
import { format } from 'date-fns'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.data.notifications)
      setUnreadCount(response.data.data.unreadCount)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FiBell className="mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 bg-primary-500 text-white text-sm px-3 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`card p-4 ${
                !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                    {!notification.isRead && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{format(new Date(notification.createdAt), 'PPp')}</span>
                    {notification.orderId && (
                      <Link
                        to={`/orders/${notification.orderId._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View Order
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

