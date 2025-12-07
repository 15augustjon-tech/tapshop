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

  // Fetch product data
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

      // Success - redirect to dashboard
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

      // Success - redirect to dashboard
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error || 'ไม่พบสินค้า'}</p>
          <Link
            href="/seller/dashboard"
            className="text-black font-medium hover:underline"
          >
            กลับหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">ลบสินค้า</h3>
            <p className="text-gray-600 mb-4">คุณต้องการลบสินค้านี้หรือไม่? การลบจะไม่สามารถกู้คืนได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'กำลังลบ...' : 'ลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h1 className="text-xl font-bold">แก้ไขสินค้า</h1>
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
          initialData={product}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="บันทึก"
        />

        {/* Delete Button */}
        <div className="mt-8 pt-8 border-t border-border">
          {deleteError && (
            <div className="mb-4 p-4 bg-red-50 text-error rounded-lg text-sm">
              {deleteError}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="w-full py-3 text-error font-medium hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            ลบสินค้า
          </button>
        </div>
      </div>
    </div>
  )
}
