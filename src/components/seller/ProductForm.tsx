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
    if (initialData) {
      setFormData(initialData)
    }
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
      <div>
        <ImageUploader
          value={formData.image_url || undefined}
          onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        />
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">ชื่อสินค้า</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, name: e.target.value }))
            if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
          }}
          placeholder="เช่น เสื้อยืดคอกลม"
          maxLength={100}
          className={`w-full px-4 py-3 border ${errors.name ? 'border-error' : 'border-border'} rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-error">{errors.name}</p>
        )}
        <p className="mt-1 text-sm text-secondary text-right">{formData.name.length}/100</p>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-2">ราคา</label>
        <div className={`flex items-center border ${errors.price ? 'border-error' : 'border-border'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-1`}>
          <span className="px-4 py-3 bg-neutral-50 text-secondary border-r border-border">฿</span>
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
            className="flex-1 px-4 py-3 outline-none"
          />
        </div>
        {errors.price && (
          <p className="mt-2 text-sm text-error">{errors.price}</p>
        )}
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium mb-2">จำนวนสินค้า</label>
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
          className={`w-full px-4 py-3 border ${errors.stock ? 'border-error' : 'border-border'} rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
        />
        {errors.stock && (
          <p className="mt-2 text-sm text-error">{errors.stock}</p>
        )}
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between py-4">
        <div>
          <p className="font-medium">แสดงในร้าน</p>
          <p className="text-sm text-secondary">เมื่อปิด ลูกค้าจะไม่เห็นสินค้านี้</p>
        </div>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            formData.is_active ? 'bg-black' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              formData.is_active ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isValid}
        className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
      >
        {loading ? 'กำลังบันทึก...' : submitLabel}
      </button>
    </form>
  )
}
