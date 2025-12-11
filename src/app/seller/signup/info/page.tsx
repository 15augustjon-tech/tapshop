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

  useEffect(() => {
    if (!slugEdited && formData.shop_name) {
      const generatedSlug = slugify(formData.shop_name)
      setFormData(prev => ({ ...prev, shop_slug: generatedSlug }))
    }
  }, [formData.shop_name, slugEdited])

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

      localStorage.setItem('seller_shop_slug', formData.shop_slug)
      router.push('/seller/signup/schedule')
    } catch {
      setErrors({ general: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-main overflow-x-hidden">
      <div className="ambient-1" />
      <div className="ambient-2" />
      <div className="px-4 pt-[env(safe-area-inset-top)] pb-8 relative z-10">
        <div className="max-w-md mx-auto pt-2">
          <ProgressBar currentStep={2} totalSteps={3} />

          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">ข้อมูลร้านค้า</h1>
          <p className="text-[#7a6f63] text-sm mb-5">กรอกข้อมูลเพื่อสร้างร้านค้าของคุณ</p>

          {errors.general && (
            <div className="mb-6 glass-card !rounded-[16px] p-4 border border-[#ef4444]/30 bg-gradient-to-r from-[#ef4444]/10 to-[#ef4444]/5">
              <p className="text-[#ef4444] font-medium">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Shop Name */}
            <div className="glass-card !rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box w-10 h-10 !rounded-[12px]">
                  <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="font-bold text-[#1a1a1a]">ชื่อร้าน</h2>
              </div>
              <input
                type="text"
                value={formData.shop_name}
                onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
                placeholder="ร้านเสื้อผ้าสมชาย"
                maxLength={50}
                className={`input-field ${errors.shop_name ? '!border-[#ef4444]' : ''}`}
              />
              {errors.shop_name && (
                <p className="mt-2 text-sm text-[#ef4444]">{errors.shop_name}</p>
              )}
            </div>

            {/* Shop URL */}
            <div className="glass-card !rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box w-10 h-10 !rounded-[12px]">
                  <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="font-bold text-[#1a1a1a]">ลิงก์ร้านค้า</h2>
              </div>
              <div className={`glass-card-inner !rounded-[14px] flex items-center overflow-hidden ${errors.shop_slug ? 'ring-2 ring-[#ef4444]' : ''}`}>
                <span className="px-4 py-3.5 bg-white/30 text-[#7a6f63] border-r border-white/50 whitespace-nowrap">
                  tapshop.me/
                </span>
                <input
                  type="text"
                  value={formData.shop_slug}
                  onChange={handleSlugChange}
                  placeholder="myshop"
                  maxLength={30}
                  className="flex-1 px-4 py-3.5 bg-transparent text-[#1a1a1a] placeholder:text-[#a69a8c] outline-none"
                />
                <div className="px-3">
                  {slugStatus === 'checking' && (
                    <div className="w-4 h-4 border-2 border-[#7a6f63] border-t-transparent rounded-full animate-spin" />
                  )}
                  {slugStatus === 'available' && (
                    <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {slugStatus === 'taken' && (
                    <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              {errors.shop_slug && (
                <p className="mt-2 text-sm text-[#ef4444]">{errors.shop_slug}</p>
              )}
              {slugStatus === 'available' && !errors.shop_slug && (
                <p className="mt-2 text-sm text-[#22c55e] font-medium">ใช้ได้!</p>
              )}
            </div>

            {/* PromptPay ID */}
            <div className="glass-card !rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#3b82f6]/20 !to-[#2563eb]/10">
                  <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="font-bold text-[#1a1a1a]">PromptPay ID (สำหรับรับเงิน)</h2>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={formData.promptpay_id}
                onChange={(e) => setFormData(prev => ({ ...prev, promptpay_id: e.target.value.replace(/\D/g, '') }))}
                placeholder="0812345678"
                maxLength={13}
                className={`input-field ${errors.promptpay_id ? '!border-[#ef4444]' : ''}`}
              />
              {errors.promptpay_id && (
                <p className="mt-2 text-sm text-[#ef4444]">{errors.promptpay_id}</p>
              )}
              <p className="mt-2 text-xs text-[#7a6f63]">เบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)</p>
            </div>

            {/* Pickup Address */}
            <div className="glass-card !rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#f59e0b]/20 !to-[#d97706]/10">
                  <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="font-bold text-[#1a1a1a]">ที่อยู่รับสินค้า</h2>
              </div>
              <AddressAutocomplete
                value={formData.pickup_address}
                onChange={handleAddressChange}
                error={errors.pickup_address}
              />
              {formData.pickup_address && formData.pickup_lat !== 0 && (
                <div className="mt-3 glass-card-inner !rounded-[12px] p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-[#1a1a1a]">{formData.pickup_address}</p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.back()}
                disabled={loading}
                className="btn-secondary flex-1 !py-4"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || slugStatus === 'checking'}
                className="btn-primary flex-1 !py-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    บันทึก...
                  </span>
                ) : (
                  'ถัดไป'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
