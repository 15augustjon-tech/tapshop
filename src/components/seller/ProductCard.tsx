'use client'

import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image_url?: string
  is_active: boolean
}

interface ProductCardProps {
  product: Product
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount)
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock < 10

  return (
    <Link
      href={`/seller/products/${product.id}`}
      className="block glass-card !rounded-[20px] overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-white/50 to-white/30">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="icon-box w-16 h-16 !rounded-[18px]">
              <svg className="w-7 h-7 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <span className="glass-card !bg-white/90 !rounded-full px-4 py-1.5 text-sm font-semibold text-[#1a1a1a]">
              สินค้าหมด
            </span>
          </div>
        )}

        {/* Inactive badge */}
        {!product.is_active && !isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <span className="glass-card !bg-white/90 !rounded-full px-4 py-1.5 text-sm font-semibold text-[#7a6f63]">
              ซ่อนอยู่
            </span>
          </div>
        )}

        {/* Low stock indicator */}
        {isLowStock && !isOutOfStock && product.is_active && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#f97316]/90 to-[#ea580c]/90 text-white shadow-lg">
              เหลือน้อย
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-[#1a1a1a] truncate mb-1.5">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-[#1a1a1a]">฿{formatCurrency(product.price)}</span>
          <span className={`text-sm font-medium ${
            isOutOfStock
              ? 'text-[#ef4444]'
              : isLowStock
                ? 'text-[#f97316]'
                : 'text-[#7a6f63]'
          }`}>
            {isOutOfStock ? 'หมด' : `${product.stock} ชิ้น`}
          </span>
        </div>
      </div>
    </Link>
  )
}
