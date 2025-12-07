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

      // Success - redirect to dashboard
      router.push('/seller/dashboard')
    } catch (err) {
      console.error('Create product error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="flex items-center justify-between px-[5%] py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/seller/dashboard"
              className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">เพิ่มสินค้า</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-[5%] py-6 max-w-md mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-error rounded-lg">
            {error}
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
