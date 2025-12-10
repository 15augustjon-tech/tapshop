'use client'

import { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'

export interface ProductData {
  name: string
  price: number | ''
  stock: number | ''
  image_url: string | null
  is_active: boolean
}

interface ProductFormProps {
  initialData?: ProductData
  onSubmit: (data: ProductData) => Promise<void>
  loading?: boolean
  submitLabel?: string
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = 'บันทึก'
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    price: '',
    stock: '',
    image_url: null,
    is_active: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadInitialData = () => {
      if (initialData) {
        setFormData(initialData)
      }
    }
    loadInitialData()
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อสินค้า'
    } else if (formData.name.length > 100) {
      newErrors.name = 'ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร'
    }

    if (formData.price === '' || formData.price === null) {
      newErrors.price = 'กรุณากรอกราคา'
    } else if (Number(formData.price) < 1) {
      newErrors.price = 'ราคาต้องมากกว่า 0'
    }

    if (formData.stock === '' || formData.stock === null) {
      newErrors.stock = 'กรุณากรอกจำนวนสินค้า'
    } else if (Number(formData.stock) < 0) {
      newErrors.stock = 'จำนวนสินค้าต้องไม่ติดลบ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    await onSubmit(formData)
  }

  const isValid =
    formData.name.trim() !== '' &&
    formData.price !== '' &&
    Number(formData.price) >= 1 &&
    formData.stock !== '' &&
    Number(formData.stock) >= 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="glass-card !rounded-[20px] p-5">
        <label className="block text-sm font-medium text-[#1a1a1a] mb-3">รูปสินค้า</label>
        <ImageUploader
          value={formData.image_url || undefined}
          onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        />
      </div>

      {/* Product Details */}
      <div className="glass-card !rounded-[20px] p-5 space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">ชื่อสินค้า</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }))
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
            }}
            placeholder="เช่น เสื้อยืดคอกลม"
            maxLength={100}
            className={`input-field ${errors.name ? '!border-[#ef4444] !ring-[#ef4444]' : ''}`}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-[#ef4444]">{errors.name}</p>
          )}
          <p className="mt-1.5 text-xs text-[#7a6f63] text-right">{formData.name.length}/100</p>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">ราคา</label>
          <div className={`glass-card-inner !rounded-[14px] flex items-center overflow-hidden ${errors.price ? 'ring-2 ring-[#ef4444]' : ''}`}>
            <span className="px-4 py-3.5 bg-white/30 text-[#7a6f63] border-r border-white/50 font-medium">฿</span>
            <input
              type="number"
              inputMode="numeric"
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value)
                setFormData(prev => ({ ...prev, price: value }))
                if (errors.price) setErrors(prev => ({ ...prev, price: '' }))
              }}
              placeholder="0"
              min="1"
              className="flex-1 px-4 py-3.5 bg-transparent text-[#1a1a1a] placeholder:text-[#a69a8c] outline-none"
            />
          </div>
          {errors.price && (
            <p className="mt-2 text-sm text-[#ef4444]">{errors.price}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">จำนวนสินค้า</label>
          <input
            type="number"
            inputMode="numeric"
            value={formData.stock}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : Number(e.target.value)
              setFormData(prev => ({ ...prev, stock: value }))
              if (errors.stock) setErrors(prev => ({ ...prev, stock: '' }))
            }}
            placeholder="0"
            min="0"
            className={`input-field ${errors.stock ? '!border-[#ef4444] !ring-[#ef4444]' : ''}`}
          />
          {errors.stock && (
            <p className="mt-2 text-sm text-[#ef4444]">{errors.stock}</p>
          )}
        </div>
      </div>

      {/* Active Toggle */}
      <div className="glass-card !rounded-[20px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#1a1a1a]">แสดงในร้าน</p>
            <p className="text-sm text-[#7a6f63]">เมื่อปิด ลูกค้าจะไม่เห็นสินค้านี้</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
            className={`relative w-14 h-8 rounded-full transition-all ${
              formData.is_active
                ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]'
                : 'bg-[#d1d5db]'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                formData.is_active ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isValid}
        className="btn-primary w-full !py-4"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            กำลังบันทึก...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
