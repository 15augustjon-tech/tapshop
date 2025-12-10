'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CheckoutAddress {
  name: string
  phone: string
  address: string
  lat: number
  lng: number
  notes: string
}

export interface DeliveryQuote {
  distance: number
  deliveryFee: number
  codFee: number
  deliveryDate: string
  deliveryTime: string
  deliverySlotFull: string
}

export interface CheckoutData {
  address: CheckoutAddress | null
  quote: DeliveryQuote | null
  saveAddress: boolean
}

const CHECKOUT_KEY = 'tapshop_checkout'

export function useCheckout(shopSlug: string) {
  const [data, setData] = useState<CheckoutData>({
    address: null,
    quote: null,
    saveAddress: false
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    const loadCheckout = () => {
      const stored = sessionStorage.getItem(CHECKOUT_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Only use if same shop
          if (parsed.shopSlug === shopSlug) {
            setData({
              address: parsed.address || null,
              quote: parsed.quote || null,
              saveAddress: parsed.saveAddress || false
            })
          }
        } catch {
          // Invalid JSON - ignore
        }
      }
      setIsLoaded(true)
    }
    loadCheckout()
  }, [shopSlug])

  // Save to sessionStorage when data changes
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({
        shopSlug,
        ...data
      }))
    }
  }, [data, isLoaded, shopSlug])

  const setAddress = useCallback((address: CheckoutAddress) => {
    setData(prev => ({ ...prev, address }))
  }, [])

  const setQuote = useCallback((quote: DeliveryQuote) => {
    setData(prev => ({ ...prev, quote }))
  }, [])

  const setSaveAddress = useCallback((saveAddress: boolean) => {
    setData(prev => ({ ...prev, saveAddress }))
  }, [])

  const clearCheckout = useCallback(() => {
    setData({ address: null, quote: null, saveAddress: false })
    sessionStorage.removeItem(CHECKOUT_KEY)
  }, [])

  return {
    address: data.address,
    quote: data.quote,
    saveAddress: data.saveAddress,
    isLoaded,
    setAddress,
    setQuote,
    setSaveAddress,
    clearCheckout
  }
}
