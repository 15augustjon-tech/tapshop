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
      <div className="flex flex-col items-center justify-center py-20 px-5">
        <svg className="w-20 h-20 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-secondary text-lg">ยังไม่มีสินค้า</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24 md:px-[5%]">
      {/* Grid: 2 columns mobile, 3 columns desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  )
}
