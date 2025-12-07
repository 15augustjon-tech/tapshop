'use client'

interface ConfirmationBannerProps {
  pendingCount: number
  onConfirmAll: () => void
  loading?: boolean
}

export default function ConfirmationBanner({ pendingCount, onConfirmAll, loading }: ConfirmationBannerProps) {
  if (pendingCount === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-medium">คุณมี {pendingCount} ออเดอร์รอยืนยัน</p>
          <p className="text-sm text-secondary">กรุณายืนยันเพื่อเริ่มจัดส่ง</p>
        </div>
      </div>
      <button
        onClick={onConfirmAll}
        disabled={loading}
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'กำลังยืนยัน...' : 'ยืนยันทั้งหมด'}
      </button>
    </div>
  )
}
