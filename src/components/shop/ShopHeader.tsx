'use client'

interface ShopHeaderProps {
  shopName: string
  cartCount: number
  onCartClick: () => void
}

export default function ShopHeader({ shopName, cartCount, onCartClick }: ShopHeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-border z-30">
      <div className="flex items-center justify-between px-[5%] h-[60px]">
        {/* Shop Name */}
        <h1 className="text-lg font-bold truncate">{shopName}</h1>

        {/* Cart Icon */}
        <button
          onClick={onCartClick}
          className="relative p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {/* Badge */}
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
