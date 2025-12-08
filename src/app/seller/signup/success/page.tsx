'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ShopQRCode from '@/components/seller/ShopQRCode'

export default function SuccessPage() {
  const [shopSlug, setShopSlug] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get shop slug from localStorage
    const slug = localStorage.getItem('seller_shop_slug')
    if (slug) {
      setShopSlug(slug)
    }
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
    <div className="min-h-screen bg-white px-[5%] py-8 flex flex-col items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-success"
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
        <h1 className="text-3xl font-bold mb-4">ร้านพร้อมใช้งานแล้ว</h1>

        {/* Shop Link */}
        {shopSlug && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-neutral-100 rounded-lg">
              <span className="text-lg font-medium">{shopUrl}</span>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-neutral-200 rounded transition-colors"
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
            {copied && (
              <p className="mt-2 text-sm text-success">คัดลอกแล้ว!</p>
            )}
          </div>
        )}

        <p className="text-secondary mb-6">แชร์ลิงก์นี้ให้ลูกค้าของคุณ</p>

        {/* QR Code Section */}
        {shopSlug && (
          <div className="mb-8 p-6 bg-neutral-50 rounded-xl">
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
            className="block w-full py-4 bg-black text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors text-center"
          >
            เพิ่มสินค้า
          </Link>
          <Link
            href="/seller/dashboard"
            className="block w-full py-4 border border-border font-semibold rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            ไปหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  )
}
