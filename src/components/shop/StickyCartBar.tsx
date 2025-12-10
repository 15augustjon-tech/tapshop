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
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 safe-area-bottom animate-slide-up">
      <div className="glass-card p-4 !rounded-[24px]">
        <div className="flex items-center justify-between relative z-10">
          {/* Cart Summary */}
          <div>
            <p className="text-[13px] text-[#7a6f63]">{itemCount} รายการในตะกร้า</p>
            <p className="text-[20px] font-bold text-[#1a1a1a]">฿{subtotal.toLocaleString()}</p>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onClick}
            className="btn-primary !py-4 !px-6"
          >
            ดูตะกร้า
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
