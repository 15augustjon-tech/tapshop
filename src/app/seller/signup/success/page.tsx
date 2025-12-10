'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ShopQRCode from '@/components/seller/ShopQRCode'

export default function SuccessPage() {
  const [shopSlug, setShopSlug] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadSlug = () => {
      const slug = localStorage.getItem('seller_shop_slug')
      if (slug) {
        setShopSlug(slug)
      }
    }
    loadSlug()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-main overflow-x-hidden flex flex-col items-center justify-center">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      <div className="px-4 py-8 w-full max-w-md mx-auto text-center relative z-10">
        {/* Success Icon with animation */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-lg animate-pop">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">ร้านพร้อมใช้งานแล้ว!</h1>
        <p className="text-[#7a6f63] mb-8">แชร์ลิงก์นี้ให้ลูกค้าของคุณเพื่อเริ่มขาย</p>

        {/* Shop Link */}
        {shopSlug && (
          <div className="glass-card !rounded-[20px] p-5 mb-6">
            <div className="glass-card-inner !rounded-[14px] p-4 flex items-center justify-between gap-3">
              <div className="icon-box w-10 h-10 !rounded-[10px] flex-shrink-0">
                <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <span className="flex-1 font-medium text-[#1a1a1a] text-left truncate">{shopUrl}</span>
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white'
                    : 'glass-card-inner hover:bg-white/60 text-[#1a1a1a]'
                }`}
              >
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        {shopSlug && (
          <div className="glass-card !rounded-[24px] p-6 mb-8">
            <ShopQRCode
              shopSlug={shopSlug}
              size={180}
              instruction="ลูกค้าสแกน QR เพื่อเข้าร้าน"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/seller/products/new"
            className="btn-primary block w-full !py-4"
          >
            เพิ่มสินค้าชิ้นแรก
          </Link>
          <Link
            href="/seller/dashboard"
            className="btn-secondary block w-full !py-4 text-center"
          >
            ไปหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  )
}
