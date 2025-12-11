'use client'

interface DashboardHeaderProps {
  shopName: string
}

export default function DashboardHeader({ shopName }: DashboardHeaderProps) {
  const initial = shopName?.charAt(0)?.toUpperCase() || 'S'

  return (
    <header className="flex items-center py-2">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="avatar w-11 h-11 text-base">
          {initial}
        </div>
        <div>
          <p className="text-[#7a6f63] text-xs">สวัสดี,</p>
          <p className="font-bold text-base text-[#1a1a1a]">{shopName || 'ร้านค้า'}</p>
        </div>
      </div>
    </header>
  )
}
