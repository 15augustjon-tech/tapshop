'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'

export default function ShopInfoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_slug: '',
    promptpay_id: '',
    pickup_address: '',
    pickup_lat: 0,
    pickup_lng: 0
  })
  const [slugEdited, setSlugEdited] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Auto-generate slug from shop name
  useEffect(() => {
    if (!slugEdited && formData.shop_name) {
      const generatedSlug = slugify(formData.shop_name)
      setFormData(prev => ({ ...prev, shop_slug: generatedSlug }))
    }
  }, [formData.shop_name, slugEdited])

  // Check slug availability with debounce
  useEffect(() => {
    if (!formData.shop_slug || formData.shop_slug.length < 3) {
      setSlugStatus(null)
      return
    }

    setSlugStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sellers/check-slug?slug=${formData.shop_slug}`)
        const data = await res.json()
        setSlugStatus(data.available ? 'available' : 'taken')
      } catch {
        setSlugStatus(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.shop_slug])

  const handleAddressChange = useCallback((address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      pickup_address: address,
      pickup_lat: lat,
      pickup_lng: lng
    }))
    setErrors(prev => ({ ...prev, pickup_address: '' }))
  }, [])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlugEdited(true)
    setFormData(prev => ({ ...prev, shop_slug: value }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.shop_name.trim()) {
      newErrors.shop_name = 'กรุณากรอกชื่อร้าน'
    } else if (formData.shop_name.length > 50) {
      newErrors.shop_name = 'ชื่อร้านต้องไม่เกิน 50 ตัวอักษร'
    }

    if (!formData.shop_slug) {
      newErrors.shop_slug = 'กรุณากรอกลิงก์ร้านค้า'
    } else if (formData.shop_slug.length < 3) {
      newErrors.shop_slug = 'ลิงก์ต้องมีอย่างน้อย 3 ตัวอักษร'
    } else if (slugStatus === 'taken') {
      newErrors.shop_slug = 'ลิงก์นี้ถูกใช้แล้ว'
    }

    if (!formData.promptpay_id) {
      newErrors.promptpay_id = 'กรุณากรอก PromptPay ID'
    } else {
      const digits = formData.promptpay_id.replace(/\D/g, '')
      if (digits.length !== 10 && digits.length !== 13) {
        newErrors.promptpay_id = 'ต้องเป็นเบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)'
      }
    }

    if (!formData.pickup_address || !formData.pickup_lat || !formData.pickup_lng) {
      newErrors.pickup_address = 'กรุณาเลือกที่อยู่จากรายการ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)

    try {
      const res = await fetch('/api/sellers/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!data.success) {
        if (data.error === 'slug_taken') {
          setErrors({ shop_slug: data.message })
        } else {
          setErrors({ general: data.message })
        }
        return
      }

      // Save to localStorage for state persistence
      localStorage.setItem('seller_shop_slug', formData.shop_slug)

      router.push('/seller/signup/schedule')
    } catch (err) {
      setErrors({ general: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-[5%] py-8">
      <div className="max-w-md mx-auto">
        <ProgressBar currentStep={2} totalSteps={3} />

        <h1 className="text-3xl font-bold mb-8">ข้อมูลร้านค้า</h1>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 text-error rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium mb-2">ชื่อร้าน</label>
            <input
              type="text"
              value={formData.shop_name}
              onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
              placeholder="ร้านเสื้อผ้าสมชาย"
              maxLength={50}
              className={`w-full px-4 py-3 border ${errors.shop_name ? 'border-error' : 'border-border'} rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
            />
            {errors.shop_name && (
              <p className="mt-2 text-sm text-error">{errors.shop_name}</p>
            )}
          </div>

          {/* Shop URL */}
          <div>
            <label className="block text-sm font-medium mb-2">ลิงก์ร้านค้า</label>
            <div className={`flex items-center border ${errors.shop_slug ? 'border-error' : 'border-border'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-1`}>
              <span className="px-4 py-3 bg-neutral-50 text-secondary border-r border-border whitespace-nowrap">
                tapshop.me/
              </span>
              <input
                type="text"
                value={formData.shop_slug}
                onChange={handleSlugChange}
                placeholder="myshop"
                maxLength={30}
                className="flex-1 px-4 py-3 outline-none"
              />
              <div className="px-3">
                {slugStatus === 'checking' && (
                  <span className="text-secondary">...</span>
                )}
                {slugStatus === 'available' && (
                  <span className="text-success">✓</span>
                )}
                {slugStatus === 'taken' && (
                  <span className="text-error">✗</span>
                )}
              </div>
            </div>
            {errors.shop_slug && (
              <p className="mt-2 text-sm text-error">{errors.shop_slug}</p>
            )}
            {slugStatus === 'available' && !errors.shop_slug && (
              <p className="mt-2 text-sm text-success">ใช้ได้</p>
            )}
            {slugStatus === 'taken' && !errors.shop_slug && (
              <p className="mt-2 text-sm text-error">ถูกใช้แล้ว</p>
            )}
          </div>

          {/* PromptPay ID */}
          <div>
            <label className="block text-sm font-medium mb-2">PromptPay ID (สำหรับรับเงิน)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.promptpay_id}
              onChange={(e) => setFormData(prev => ({ ...prev, promptpay_id: e.target.value.replace(/\D/g, '') }))}
              placeholder="0812345678"
              maxLength={13}
              className={`w-full px-4 py-3 border ${errors.promptpay_id ? 'border-error' : 'border-border'} rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
            />
            {errors.promptpay_id && (
              <p className="mt-2 text-sm text-error">{errors.promptpay_id}</p>
            )}
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-medium mb-2">ที่อยู่รับสินค้า</label>
            <AddressAutocomplete
              value={formData.pickup_address}
              onChange={handleAddressChange}
              error={errors.pickup_address}
            />
            {formData.pickup_address && formData.pickup_lat && (
              <p className="mt-2 text-sm text-secondary">
                📍 {formData.pickup_address}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 py-4 border border-border rounded-lg font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || slugStatus === 'checking'}
              className="flex-1 py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            >
              {loading ? 'กำลังบันทึก...' : 'ถัดไป'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
