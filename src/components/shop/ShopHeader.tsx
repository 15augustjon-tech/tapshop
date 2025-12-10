'use client'

interface ShopHeaderProps {
  shopName: string
  cartCount: number
  onCartClick: () => void
}

export default function ShopHeader({ shopName, cartCount, onCartClick }: ShopHeaderProps) {
  // Get first character for avatar
  const initial = shopName?.charAt(0)?.toUpperCase() || 'S'

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass-card !rounded-[20px] px-4 py-3">
        <div className="flex items-center justify-between relative z-10">
          {/* Shop Info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar w-11 h-11 text-lg animate-pop" style={{ animationDelay: '0.2s' }}>
              {initial}
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[#1a1a1a] leading-tight">{shopName}</h1>
              <div className="flex items-center gap-1.5 text-[12px] text-[#7a6f63]">
                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse-dot" />
                <span>ร้านยืนยันแล้ว</span>
              </div>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={onCartClick}
            className="relative w-12 h-12 glass-card-inner !rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300"
          >
            <svg className="w-[22px] h-[22px] text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {/* Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pop">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
