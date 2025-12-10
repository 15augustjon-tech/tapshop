'use client'

interface EmptyStateProps {
  icon: 'orders' | 'products'
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon with premium styling */}
      <div className="icon-box w-24 h-24 !rounded-[28px] mb-6 animate-bounce-gentle">
        {icon === 'orders' ? (
          <svg className="w-10 h-10 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{title}</h3>
      {description && (
        <p className="text-[#7a6f63] mb-6 max-w-xs">{description}</p>
      )}

      {/* Action button with premium styling */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
