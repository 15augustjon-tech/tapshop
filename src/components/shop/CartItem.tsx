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
  const itemTotal = item.price * item.quantity

  return (
    <div className="glass-card-inner !rounded-[16px] p-3 mb-3 last:mb-0">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-[12px] overflow-hidden bg-gradient-to-br from-[#f0e9df] to-[#e8dfd3]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <div className="size-full flex items-center justify-center">
              <svg className="w-7 h-7 text-[#a69a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h4 className="font-semibold text-[14px] text-[#1a1a1a] line-clamp-2 leading-tight">{item.name}</h4>
            <p className="text-[13px] text-[#7a6f63] mt-0.5">
              ฿{item.price.toLocaleString()} x {item.quantity}
            </p>
          </div>
          <p className="text-[15px] font-bold text-[#1a1a1a]">
            ฿{itemTotal.toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end justify-between">
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="w-8 h-8 flex items-center justify-center text-[#a69a8c] hover:text-[#ef4444] hover:bg-red-50/50 rounded-full transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    </div>
  )
}
