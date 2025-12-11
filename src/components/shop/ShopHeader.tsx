'use client'

interface ShopHeaderProps {
  shopName: string
  shopBio?: string
  cartCount: number
  onCartClick: () => void
}

export default function ShopHeader({ shopName, shopBio, cartCount, onCartClick }: ShopHeaderProps) {
  // Get first character for avatar
  const initial = shopName?.charAt(0)?.toUpperCase() || 'S'

  return (
    <header className="relative z-30">
      {/* Top bar with cart */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={onCartClick}
          className="relative w-11 h-11 bg-white/80 backdrop-blur-lg rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-sm border border-white/50"
        >
          <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Shop Profile Section */}
      <div className="pt-5 pb-4 px-5 text-center">
        {/* Avatar */}
        <div
          className="w-20 h-20 mx-auto mb-3.5 rounded-full flex items-center justify-center text-[32px] shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            boxShadow: '0 8px 24px rgba(236,72,153,0.25)'
          }}
        >
          {initial}
        </div>

        {/* Shop Name */}
        <h1 className="text-2xl font-black text-[#1a1a1a] mb-1">{shopName}</h1>

        {/* Verified Badge */}
        <span className="inline-flex items-center gap-1 text-[12px] text-[#22c55e] font-semibold bg-[#22c55e]/10 px-2.5 py-1 rounded-full mb-3">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          ร้านยืนยันแล้ว
        </span>

        {/* Bio */}
        {shopBio && (
          <p className="text-sm text-[#7a6f63] leading-relaxed px-4 mb-4">{shopBio}</p>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="text-lg font-extrabold text-[#1a1a1a]">4.9</div>
            <div className="text-[11px] text-[#7a6f63]">Rating ⭐</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold text-[#1a1a1a]">234</div>
            <div className="text-[11px] text-[#7a6f63]">ขายแล้ว</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold text-[#1a1a1a]">98%</div>
            <div className="text-[11px] text-[#7a6f63]">ตอบกลับ</div>
          </div>
        </div>
      </div>
    </header>
  )
}
