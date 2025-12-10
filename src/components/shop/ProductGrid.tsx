'use client'

import ProductCard from './ProductCard'
import type { Product } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export default function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="px-4 pt-6">
        <div className="glass-card !rounded-[24px] flex flex-col items-center justify-center py-16 px-6">
          <div className="icon-box w-20 h-20 !rounded-[24px] mb-5 animate-bounce-gentle">
            <svg className="w-10 h-10 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-[#1a1a1a] text-lg font-semibold mb-1">ยังไม่มีสินค้า</p>
          <p className="text-[#a69a8c] text-sm">รอสินค้าเพิ่มเติมเร็วๆ นี้</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-32">
      {/* Grid: 2 columns mobile, 3 columns desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
