'use client'

interface QuantitySelectorProps {
  quantity: number
  max: number
  onChange: (quantity: number) => void
  size?: 'sm' | 'md'
}

export default function QuantitySelector({
  quantity,
  max,
  onChange,
  size = 'md'
}: QuantitySelectorProps) {
  const buttonSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const textSize = size === 'sm' ? 'w-7 text-[13px]' : 'w-10 text-[15px]'
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  const decrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1)
    }
  }

  const increment = () => {
    if (quantity < max) {
      onChange(quantity + 1)
    }
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={decrement}
        disabled={quantity <= 1}
        className={`${buttonSize} flex items-center justify-center glass-card-inner !rounded-l-[10px] !rounded-r-none hover:bg-white/60 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <svg className={`${iconSize} text-[#1a1a1a]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
        </svg>
      </button>
      <span className={`${textSize} text-center font-semibold text-[#1a1a1a] bg-white/30`}>{quantity}</span>
      <button
        type="button"
        onClick={increment}
        disabled={quantity >= max}
        className={`${buttonSize} flex items-center justify-center glass-card-inner !rounded-r-[10px] !rounded-l-none hover:bg-white/60 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <svg className={`${iconSize} text-[#1a1a1a]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
