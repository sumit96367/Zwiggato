import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { ShoppingCart, User, LogOut, Home, Menu, Bell, ChefHat, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth()
  const { getCartItemCount } = useCart()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stunning Header with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Zwiggato
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link 
                to="/restaurants" 
                className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
              >
                Restaurants
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/recommendations" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
                  >
                    For You
                  </Link>
                  <Link 
                    to="/orders" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 font-medium transition-all duration-200"
                  >
                    My Orders
                  </Link>
                  {user?.role === 'customer' && (
                    <>
                      <Link 
                        to="/notifications" 
                        className="relative px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                      >
                        <Bell className="w-5 h-5" />
                      </Link>
                      <Link 
                        to="/cart" 
                        className="relative px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {getCartItemCount() > 0 && (
                          <Badge 
                            variant="error" 
                            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                          >
                            {getCartItemCount()}
                          </Badge>
                        )}
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user?.name}</span>
                  </Link>
                  
                  {user?.role === 'restaurant' && (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hidden md:flex"
                      >
                        <Link to="/restaurant/dashboard">
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="hidden md:flex"
                      >
                        <Link to="/restaurant/create">
                          Create Restaurant
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                  
                  {user?.role === 'admin' && (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hidden md:flex"
                      >
                        <Link to="/admin/dashboard">
                          Admin Panel
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="hidden md:flex"
                      >
                        <Link to="/restaurant/create">
                          Create Restaurant
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                  
                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 font-medium transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Button
                    asChild
                    size="sm"
                  >
                    <Link to="/register">
                      Sign Up
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/restaurants" 
                className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Restaurants
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to="/recommendations" 
                    className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    For You
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {user?.role === 'customer' && (
                    <>
                      <Link 
                        to="/notifications" 
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Notifications
                      </Link>
                      <Link 
                        to="/cart" 
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Cart {getCartItemCount() > 0 && `(${getCartItemCount()})`}
                      </Link>
                    </>
                  )}
                  {user?.role === 'restaurant' && (
                    <>
                      <Link 
                        to="/restaurant/dashboard" 
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/restaurant/create" 
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Restaurant
                      </Link>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link 
                        to="/admin/dashboard" 
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                      <Link 
                        to="/restaurant/create" 
                        className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Restaurant
                      </Link>
                    </>
                  )}
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content with Header Spacing */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Zwiggato</span>
              </div>
              <p className="text-gray-400">Delicious food delivered to your doorstep</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">Email: support@zwiggato.com</p>
              <p className="text-gray-400">Phone: +91 1800-123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Zwiggato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
