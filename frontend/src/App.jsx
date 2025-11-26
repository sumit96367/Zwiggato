import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RestaurantListPage from './pages/RestaurantListPage'
import RestaurantDetailPage from './pages/RestaurantDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import RestaurantDashboard from './pages/restaurant/Dashboard'
import RestaurantMenuManagement from './pages/restaurant/MenuManagement'
import RestaurantOrders from './pages/restaurant/Orders'
import RestaurantAnalytics from './pages/restaurant/Analytics'
import CreateRestaurant from './pages/restaurant/CreateRestaurant'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminRestaurants from './pages/admin/Restaurants'
import AdminOrders from './pages/admin/Orders'
import AdminAnalytics from './pages/admin/Analytics'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/restaurants" element={<Layout><RestaurantListPage /></Layout>} />
      <Route path="/restaurants/:id" element={<Layout><RestaurantDetailPage /></Layout>} />
      <Route path="/recommendations" element={<Layout><RecommendationsPage /></Layout>} />
      
      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><CartPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><CheckoutPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><OrderTrackingPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><OrderHistoryPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout><NotificationsPage /></Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Restaurant Routes */}
      <Route
        path="/restaurant/create"
        element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <Layout><CreateRestaurant /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/dashboard"
        element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <RestaurantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/menu"
        element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <RestaurantMenuManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/orders"
        element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <RestaurantOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurant/analytics"
        element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <RestaurantAnalytics />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/restaurants"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRestaurants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

