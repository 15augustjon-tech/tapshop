'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import QuantitySelector from './QuantitySelector'
import type { Product } from './ProductCard'

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number) => void
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)

  // Reset quantity when product changes
  useEffect(() => {
    const resetQuantity = () => setQuantity(1)
    resetQuantity()
  }, [product?.id])

  // Handle escape key
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

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    onAddToCart(product, quantity)
    onClose()
  }

  const isLowStock = product.stock > 0 && product.stock < 5

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - slide up from bottom */}
      <div className="fixed inset-x-4 bottom-4 z-50 glass-card !rounded-[32px] max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#a69a8c]/50 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 glass-card-inner !rounded-full flex items-center justify-center hover:scale-110 transition-transform z-10"
        >
          <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-60px)]">
          {/* Product Image - 1:1 aspect */}
          <div className="relative aspect-square mx-4 rounded-[20px] overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-gradient-to-br from-[#f0e9df] to-[#e8dfd3]">
                <svg className="w-20 h-20 text-[#a69a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{product.name}</h2>
            <p className="text-3xl font-extrabold text-[#1a1a1a] mb-4">฿{product.price.toLocaleString()}</p>

            {/* Stock info */}
            {isLowStock && (
              <div className="badge badge-warning mb-4">
                เหลือ {product.stock} ชิ้น
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center justify-between mb-6 p-4 glass-card-inner !rounded-[16px]">
              <span className="text-[#7a6f63] font-medium">จำนวน</span>
              <QuantitySelector
                quantity={quantity}
                max={product.stock}
                onChange={setQuantity}
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-[#7a6f63]">รวม</span>
              <span className="text-2xl font-bold text-[#1a1a1a]">
                ฿{(product.price * quantity).toLocaleString()}
              </span>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary w-full"
            >
              เพิ่มลงตะกร้า
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
