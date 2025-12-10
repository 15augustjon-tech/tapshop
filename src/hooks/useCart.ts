'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null
  stock: number
}

export interface Cart {
  shopSlug: string
  items: CartItem[]
}

const CART_KEY = 'tapshop_cart'

export function useCart(shopSlug: string) {
  const [cart, setCart] = useState<Cart>({ shopSlug, items: [] })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) {
        try {
          const parsed: Cart = JSON.parse(stored)
          // Clear cart if it's for a different shop
          if (parsed.shopSlug === shopSlug) {
            setCart(parsed)
          } else {
            // Different shop - clear cart
            const newCart = { shopSlug, items: [] }
            setCart(newCart)
            localStorage.setItem(CART_KEY, JSON.stringify(newCart))
          }
        } catch {
          // Invalid JSON - reset cart
          const newCart = { shopSlug, items: [] }
          setCart(newCart)
          localStorage.setItem(CART_KEY, JSON.stringify(newCart))
        }
      } else {
        setCart({ shopSlug, items: [] })
      }
      setIsLoaded(true)
    }
    loadCart()
  }, [shopSlug])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.items.findIndex(i => i.productId === item.productId)

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const newItems = [...prev.items]
        const newQuantity = newItems[existingIndex].quantity + quantity
        // Don't exceed stock
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: Math.min(newQuantity, item.stock)
        }
        return { ...prev, items: newItems }
      } else {
        // Add new item
        return {
          ...prev,
          items: [...prev.items, { ...item, quantity: Math.min(quantity, item.stock) }]
        }
      }
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          ...prev,
          items: prev.items.filter(i => i.productId !== productId)
        }
      }

      return {
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, item.stock) }
            : item
        )
      }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(i => i.productId !== productId)
    }))
  }, [])

  const clearCart = useCallback(() => {
    const newCart = { shopSlug, items: [] }
    setCart(newCart)
    localStorage.setItem(CART_KEY, JSON.stringify(newCart))
  }, [shopSlug])

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  const getSubtotal = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [cart.items])

  const getItem = useCallback((productId: string) => {
    return cart.items.find(i => i.productId === productId)
  }, [cart.items])

  return {
    cart,
    items: cart.items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    getItem
  }
}
