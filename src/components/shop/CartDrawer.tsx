'use client'

import { useEffect } from 'react'
import CartItem from './CartItem'
import type { CartItem as CartItemType } from '@/hooks/useCart'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItemType[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  subtotal: number
  onCheckout: () => void
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  onCheckout
}: CartDrawerProps) {
  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isEmpty = items.length === 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - slide from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl animate-slide-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold">ตะกร้าสินค้า</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full px-5 py-12">
              <svg className="w-20 h-20 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-secondary text-lg mb-6">ตะกร้าว่าง</p>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-black font-medium rounded-lg hover:bg-neutral-100 transition-colors"
              >
                เลือกสินค้า
              </button>
            </div>
          ) : (
            <div className="px-5">
              {items.map(item => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={(qty) => onUpdateQuantity(item.productId, qty)}
                  onRemove={() => onRemoveItem(item.productId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - only show if cart has items */}
        {!isEmpty && (
          <div className="border-t border-border px-5 py-4 bg-white">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-secondary">รวม</span>
              <span className="text-xl font-bold">฿{subtotal.toLocaleString()}</span>
            </div>

            {/* Checkout button */}
            <button
              onClick={onCheckout}
              className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
            >
              ไปชำระเงิน
            </button>
          </div>
        )}
      </div>
    </>
  )
}
