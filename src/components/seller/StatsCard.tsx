'use client'

import { useState } from 'react'

interface StatsCardProps {
  totalEarnings: number
  shopSlug: string
}

export default function StatsCard({ totalEarnings, shopSlug }: StatsCardProps) {
  const [copied, setCopied] = useState(false)
  const shopUrl = `tapshop.me/${shopSlug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${shopUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  return (
    <div className="glass-card !rounded-[24px] p-6 overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#22c55e]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

      {/* Earnings */}
      <div className="mb-5 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-lg text-[#7a6f63]">฿</span>
          <span className="text-4xl font-bold text-[#1a1a1a]">{formatCurrency(totalEarnings)}</span>
        </div>
        <p className="text-[#7a6f63] text-sm mt-1">รายได้ทั้งหมด</p>
      </div>

      {/* Shop Link */}
      {shopSlug && (
        <div className="glass-card-inner !rounded-[14px] p-3 flex items-center gap-2">
          <div className="icon-box w-9 h-9 !rounded-[10px] flex-shrink-0">
            <svg className="w-4 h-4 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="flex-1 text-sm font-medium text-[#1a1a1a] truncate">{shopUrl}</span>
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              copied
                ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white'
                : 'glass-card-inner hover:bg-white/60 text-[#1a1a1a]'
            }`}
          >
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
          </button>
        </div>
      )}
    </div>
  )
}
