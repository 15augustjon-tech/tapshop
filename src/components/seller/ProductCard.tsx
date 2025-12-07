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
      className="block bg-white rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square bg-neutral-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
              สินค้าหมด
            </span>
          </div>
        )}

        {/* Inactive badge */}
        {!product.is_active && !isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
              ซ่อนอยู่
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold">฿{formatCurrency(product.price)}</span>
          <span className={`text-sm ${isLowStock ? 'text-orange-500 font-medium' : 'text-secondary'}`}>
            เหลือ {product.stock}
          </span>
        </div>
      </div>
    </Link>
  )
}
