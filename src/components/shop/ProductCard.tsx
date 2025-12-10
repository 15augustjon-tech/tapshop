'use client'

import Image from 'next/image'

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  image_url: string | null
}

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock < 5

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOutOfStock}
      className="w-full text-left group disabled:cursor-not-allowed animate-card"
    >
      {/* Card Container */}
      <div className="glass-card overflow-hidden !rounded-[20px] transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        {/* Image Container - 1:1 aspect ratio */}
        <div className="relative aspect-square overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-gradient-to-br from-[#f0e9df] to-[#e8dfd3]">
              <svg className="w-12 h-12 text-[#a69a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          {/* Tags */}
          {isLowStock && !isOutOfStock && (
            <span className="absolute top-2 left-2 badge badge-warning text-[10px] py-1 px-2.5">
              เหลือ {product.stock}
            </span>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="glass-card-inner px-4 py-2 !rounded-full text-[13px] font-semibold text-[#7a6f63]">
                สินค้าหมด
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3.5 relative z-10">
          <h3 className="font-semibold text-[#1a1a1a] line-clamp-2 text-[14px] leading-snug mb-1.5">
            {product.name}
          </h3>
          <span className="text-[17px] font-bold text-[#1a1a1a]">
            ฿{product.price.toLocaleString()}
          </span>
        </div>
      </div>
    </button>
  )
}
