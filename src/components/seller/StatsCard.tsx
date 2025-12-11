'use client'

interface StatsCardProps {
  totalEarnings: number
  shopSlug: string
  todayOrders?: number
  totalViews?: number
}

export default function StatsCard({ totalEarnings, todayOrders = 0, totalViews = 0 }: StatsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  return (
    <div className="rounded-[24px] p-6 overflow-hidden relative" style={{
      background: 'linear-gradient(135deg, rgba(240,253,244,0.95) 0%, rgba(220,252,231,0.85) 100%)',
      backdropFilter: 'blur(40px)',
      border: '1.5px solid rgba(134,239,172,0.4)',
      boxShadow: '0 8px 32px rgba(34,197,94,0.1)'
    }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[13px] font-semibold text-[#166534]">รายได้วันนี้</span>
        <span className="text-[12px] font-semibold text-[#22c55e] px-2.5 py-1 bg-white/60 rounded-full">วันนี้</span>
      </div>

      {/* Main Revenue */}
      <div className="mb-1">
        <span className="text-4xl font-black text-[#166534] tracking-tight">฿{formatCurrency(totalEarnings)}</span>
      </div>
      <div className="flex items-center gap-1 text-[13px] font-semibold text-[#22c55e] mb-5">
        <span>↑</span>
        <span>เปิดร้านแล้ว</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center py-3 px-2 bg-white/60 rounded-[14px]">
          <div className="text-xl font-extrabold text-[#166534]">{todayOrders}</div>
          <div className="text-[11px] font-semibold text-[#22c55e] mt-0.5">ออเดอร์</div>
        </div>
        <div className="text-center py-3 px-2 bg-white/60 rounded-[14px]">
          <div className="text-xl font-extrabold text-[#166534]">4.9</div>
          <div className="text-[11px] font-semibold text-[#22c55e] mt-0.5">Rating ⭐</div>
        </div>
        <div className="text-center py-3 px-2 bg-white/60 rounded-[14px]">
          <div className="text-xl font-extrabold text-[#166534]">{totalViews}</div>
          <div className="text-[11px] font-semibold text-[#22c55e] mt-0.5">เข้าชม</div>
        </div>
      </div>
    </div>
  )
}
