'use client'

interface ConfirmationBannerProps {
  pendingCount: number
  onConfirmAll: () => void
  loading?: boolean
}

export default function ConfirmationBanner({ pendingCount, onConfirmAll, loading }: ConfirmationBannerProps) {
  if (pendingCount === 0) return null

  return (
    <div className="glass-card !rounded-[20px] overflow-hidden border border-[#f59e0b]/30 bg-gradient-to-r from-[#f59e0b]/10 to-[#fbbf24]/5">
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Animated icon */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-lg animate-pulse-gentle flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#1a1a1a]">{pendingCount} ออเดอร์รอยืนยัน</p>
            <p className="text-sm text-[#7a6f63]">กดยืนยันเพื่อเริ่มจัดส่งวันนี้</p>
          </div>
        </div>
        <button
          onClick={onConfirmAll}
          disabled={loading}
          className="btn-primary !py-2.5 !px-5 whitespace-nowrap flex-shrink-0"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ยืนยัน...
            </span>
          ) : (
            'ยืนยันทั้งหมด'
          )}
        </button>
      </div>
    </div>
  )
}
