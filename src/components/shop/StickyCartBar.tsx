'use client'

interface StickyCartBarProps {
  itemCount: number
  onClick: () => void
}

export default function StickyCartBar({ itemCount, onClick }: StickyCartBarProps) {
  // Hide if cart is empty
  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 px-[5%] py-4 safe-area-bottom">
      <button
        onClick={onClick}
        className="w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
      >
        ดูตะกร้า ({itemCount} รายการ)
      </button>
    </div>
  )
}
