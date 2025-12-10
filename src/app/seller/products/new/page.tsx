'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductForm, { ProductData } from '@/components/seller/ProductForm'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data: ProductData) => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          price: data.price,
          stock: data.stock,
          image_url: data.image_url,
          is_active: data.is_active
        })
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.message || 'เกิดข้อผิดพลาด')
        return
      }

      router.push('/seller/dashboard')
    } catch (err) {
      console.error('Create product error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-main overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      {/* Header */}
      <header className="sticky top-0 z-20 px-4 pt-4">
        <div className="glass-card !rounded-[16px]">
          <div className="flex items-center px-4 h-[56px]">
            <Link
              href="/seller/dashboard"
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform -ml-2"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="flex-1 text-center font-bold text-[#1a1a1a]">เพิ่มสินค้า</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pt-4 pb-24 max-w-md mx-auto relative z-10">
        {error && (
          <div className="mb-6 glass-card !rounded-[16px] p-4 border border-[#ef4444]/30 bg-gradient-to-r from-[#ef4444]/10 to-[#ef4444]/5 animate-pop">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="font-medium text-[#dc2626]">{error}</p>
            </div>
          </div>
        )}

        <ProductForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="เพิ่มสินค้า"
        />
      </div>
    </div>
  )
}
