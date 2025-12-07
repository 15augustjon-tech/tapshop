'use client'

import Image from 'next/image'
import QuantitySelector from './QuantitySelector'
import type { CartItem as CartItemType } from '@/hooks/useCart'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-b-0">
      {/* Product Image */}
      <div className="relative w-16 h-16 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h4>
        <p className="font-semibold">
          ฿{item.price.toLocaleString()} × {item.quantity}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        {/* Remove button */}
        <button
          onClick={onRemove}
          className="p-1.5 text-neutral-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Quantity adjuster */}
        <QuantitySelector
          quantity={item.quantity}
          max={item.stock}
          onChange={onUpdateQuantity}
          size="sm"
        />
      </div>
    </div>
  )
}
