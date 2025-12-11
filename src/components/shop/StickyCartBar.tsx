'use client'

interface StickyCartBarProps {
  itemCount: number
  subtotal: number
  onClick: () => void
}

export default function StickyCartBar({ itemCount, subtotal, onClick }: StickyCartBarProps) {
  // Hide if cart is empty
  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 animate-slide-up">
      <div
        className="px-5 py-4 safe-area-bottom"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Cart Summary */}
          <div className="text-white">
            <p className="text-sm font-semibold opacity-80">🛒 {itemCount} รายการ</p>
            <p className="text-xl font-extrabold">฿{subtotal.toLocaleString()}</p>
          </div>

          {/* View Cart Button */}
          <button
            onClick={onClick}
            className="flex items-center gap-2 bg-white text-[#1a1a1a] px-7 py-3.5 rounded-full font-bold text-[15px] hover:scale-105 transition-transform"
          >
            ดูตะกร้า
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
