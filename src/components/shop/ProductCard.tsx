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
  const isLowStock = product.stock > 0 && product.stock < 10

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOutOfStock}
      className="w-full text-left group disabled:cursor-not-allowed"
    >
      {/* Image Container - 5:6 aspect ratio matching Relume */}
      <div className="relative mb-3 block aspect-[5/6] overflow-hidden rounded-lg bg-neutral-100 md:mb-4">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-3 py-1.5 rounded-full text-sm font-medium text-neutral-600">
              สินค้าหมด
            </span>
          </div>
        )}
      </div>

      {/* Product Info - matching Relume styling */}
      <div className="flex justify-between md:text-md">
        <div className="mr-4 min-w-0 flex-1">
          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
          {isLowStock && (
            <p className="text-sm text-orange-500 mt-0.5">เหลือ {product.stock} ชิ้น</p>
          )}
        </div>
        <div className="text-md font-semibold md:text-lg whitespace-nowrap">
          ฿{product.price.toLocaleString()}
        </div>
      </div>
    </button>
  )
}
