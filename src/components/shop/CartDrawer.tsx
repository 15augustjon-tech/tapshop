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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - slide from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md animate-slide-left flex flex-col">
        <div className="h-full m-4 ml-0 glass-card !rounded-l-[32px] !rounded-r-none flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/30 relative z-10">
            <h2 className="text-xl font-bold text-[#1a1a1a]">ตะกร้าสินค้า</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 glass-card-inner !rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                <div className="icon-box w-20 h-20 !rounded-[24px] mb-6 animate-bounce-gentle">
                  <span className="text-4xl">🛒</span>
                </div>
                <p className="text-[#7a6f63] text-lg mb-2">ตะกร้าว่าง</p>
                <p className="text-[#a69a8c] text-sm mb-6">เลือกสินค้าที่ต้องการได้เลย</p>
                <button
                  onClick={onClose}
                  className="btn-secondary !py-3 !px-6"
                >
                  เลือกสินค้า
                </button>
              </div>
            ) : (
              <div className="px-5 py-4">
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
            <div className="border-t border-white/30 px-6 py-5 relative z-10">
              {/* Summary */}
              <div className="glass-card-inner !rounded-[16px] p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#7a6f63]">รวมค่าสินค้า</span>
                  <span className="text-2xl font-bold text-[#1a1a1a]">฿{subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[12px] text-[#a69a8c] mt-1">ยังไม่รวมค่าจัดส่ง</p>
              </div>

              {/* Checkout button */}
              <button
                onClick={onCheckout}
                className="btn-primary w-full"
              >
                ไปชำระเงิน
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
