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
    <div className="bg-neutral-50 rounded-2xl p-6">
      {/* Earnings */}
      <div className="mb-4">
        <p className="text-4xl font-bold">฿{formatCurrency(totalEarnings)}</p>
        <p className="text-secondary">รายได้ทั้งหมด</p>
      </div>

      {/* Shop Link */}
      {shopSlug && (
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
          <span className="flex-1 text-sm font-medium truncate">{shopUrl}</span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-neutral-100 rounded transition-colors shrink-0"
            title="คัดลอกลิงก์"
          >
            {copied ? (
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
