import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    const savedRestaurantId = localStorage.getItem('cartRestaurantId')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    if (savedRestaurantId) {
      setRestaurantId(savedRestaurantId)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
    if (restaurantId) {
      localStorage.setItem('cartRestaurantId', restaurantId)
    } else {
      localStorage.removeItem('cartRestaurantId')
    }
  }, [cart, restaurantId])

  const addToCart = (item, newRestaurantId) => {
    setCart(prevCart => {
      // If adding from different restaurant, clear cart
      if (newRestaurantId !== restaurantId && prevCart.length > 0 && restaurantId) {
        const newCart = [item]
        setRestaurantId(newRestaurantId)
        return newCart
      }

      // Check if item already in cart
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.menuItemId === item.menuItemId
      )

      if (existingItemIndex >= 0) {
        // Update quantity
        const newCart = [...prevCart]
        newCart[existingItemIndex].quantity += item.quantity
        setRestaurantId(newRestaurantId)
        return newCart
      } else {
        // Add new item
        setRestaurantId(newRestaurantId)
        return [...prevCart, item]
      }
    })
  }

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    )
  }

  const removeFromCart = (menuItemId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.menuItemId !== menuItemId)
      if (newCart.length === 0) {
        setRestaurantId(null)
      }
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    setRestaurantId(null)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        restaurantId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

