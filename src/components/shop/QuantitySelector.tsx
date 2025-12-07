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
  const buttonSize = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'w-8 text-sm' : 'w-12 text-base'

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
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={decrement}
        disabled={quantity <= 1}
        className={`${buttonSize} flex items-center justify-center border border-border rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <span className={`${textSize} text-center font-medium`}>{quantity}</span>
      <button
        type="button"
        onClick={increment}
        disabled={quantity >= max}
        className={`${buttonSize} flex items-center justify-center border border-border rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
