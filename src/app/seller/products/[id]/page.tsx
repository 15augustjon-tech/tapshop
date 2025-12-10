'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductForm, { ProductData } from '@/components/seller/ProductForm'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: Props) {
  const { id: productId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [product, setProduct] = useState<ProductData | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()

        if (!data.success) {
          if (data.error === 'unauthorized') {
            router.push('/seller/signup')
            return
          }
          if (data.error === 'not_found' || data.error === 'forbidden') {
            router.push('/seller/dashboard')
            return
          }
          setError(data.message || 'เกิดข้อผิดพลาด')
          return
        }

        setProduct({
          name: data.product.name,
          price: data.product.price,
          stock: data.product.stock,
          image_url: data.product.image_url,
          is_active: data.product.is_active
        })
      } catch {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, router])

  const handleSubmit = async (data: ProductData) => {
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
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
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleteError('')
    setDeleting(true)

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      const result = await res.json()

      if (!result.success) {
        setDeleteError(result.message || 'เกิดข้อผิดพลาด')
        return
      }

      router.push('/seller/dashboard')
    } catch {
      setDeleteError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="icon-box w-16 h-16 !rounded-[20px] animate-pulse">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="ambient-1" />
        <div className="ambient-2" />
        <div className="text-center relative z-10">
          <div className="icon-box w-20 h-20 !rounded-[24px] mx-auto mb-6">
            <svg className="w-8 h-8 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[#ef4444] font-medium mb-4">{error || 'ไม่พบสินค้า'}</p>
          <Link href="/seller/dashboard" className="btn-primary">
            กลับหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-main overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="glass-card !rounded-[24px] p-6 w-full max-w-sm animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a]">ลบสินค้า</h3>
            </div>
            <p className="text-[#7a6f63] mb-6">คุณต้องการลบสินค้านี้หรือไม่? การลบจะไม่สามารถกู้คืนได้</p>

            {deleteError && (
              <p className="text-sm text-[#ef4444] mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="btn-secondary flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3.5 bg-[#ef4444] text-white rounded-[14px] font-semibold hover:bg-[#dc2626] transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ลบ...
                  </span>
                ) : (
                  'ลบ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h1 className="flex-1 text-center font-bold text-[#1a1a1a]">แก้ไขสินค้า</h1>
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
          initialData={product}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="บันทึก"
        />

        {/* Delete Button */}
        <div className="mt-8 pt-6 border-t border-white/50">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="w-full py-3.5 text-[#ef4444] font-semibold glass-card-inner !rounded-[14px] hover:bg-[#ef4444]/10 transition-all disabled:opacity-50"
          >
            ลบสินค้า
          </button>
        </div>
      </div>
    </div>
  )
}
