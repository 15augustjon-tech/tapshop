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
    setQuantity(1)
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - slide up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
          {/* Product Image - 1:1 aspect */}
          <div className="relative aspect-square bg-neutral-100">
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
              <div className="size-full flex items-center justify-center">
                <svg className="w-20 h-20 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-5">
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            <p className="text-2xl font-bold mb-4">฿{product.price.toLocaleString()}</p>

            {/* Stock info */}
            {product.stock > 0 && product.stock < 10 && (
              <p className="text-orange-500 text-sm mb-4">เหลือ {product.stock} ชิ้น</p>
            )}

            {/* Quantity selector */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-secondary">จำนวน</span>
              <QuantitySelector
                quantity={quantity}
                max={product.stock}
                onChange={setQuantity}
              />
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            >
              เพิ่มลงตะกร้า
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
