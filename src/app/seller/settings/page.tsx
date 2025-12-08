'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AddressAutocomplete from '@/components/ui/AddressAutocomplete'

interface Seller {
  id: string
  phone: string
  shop_name: string
  shop_slug: string
  promptpay_id: string
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  shipping_days: number[]
  shipping_time: string
}

const DAYS = [
  { value: 1, label: 'จ.', fullLabel: 'จันทร์' },
  { value: 2, label: 'อ.', fullLabel: 'อังคาร' },
  { value: 3, label: 'พ.', fullLabel: 'พุธ' },
  { value: 4, label: 'พฤ.', fullLabel: 'พฤหัสบดี' },
  { value: 5, label: 'ศ.', fullLabel: 'ศุกร์' },
  { value: 6, label: 'ส.', fullLabel: 'เสาร์' },
  { value: 7, label: 'อา.', fullLabel: 'อาทิตย์' }
]

const TIME_SLOTS = [
  { value: '10:00', label: 'รอบเช้า (10:00)' },
  { value: '14:00', label: 'รอบบ่าย (14:00)' },
  { value: '18:00', label: 'รอบเย็น (18:00)' }
]

export default function SellerSettingsPage() {
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [shopName, setShopName] = useState('')
  const [promptpayId, setPromptpayId] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupLat, setPickupLat] = useState(0)
  const [pickupLng, setPickupLng] = useState(0)
  const [shippingDays, setShippingDays] = useState<number[]>([])
  const [shippingTime, setShippingTime] = useState('')

  // Fetch seller data
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch('/api/sellers/me')
        const data = await res.json()

        if (!data.success) {
          if (data.error === 'unauthorized') {
            router.push('/seller/login')
            return
          }
          throw new Error(data.message)
        }

        // Fix #4: Redirect if onboarding not completed
        if (!data.seller.onboarding_completed) {
          router.push('/seller/signup/info')
          return
        }

        setSeller(data.seller)
        setShopName(data.seller.shop_name || '')
        setPromptpayId(data.seller.promptpay_id || '')
        setPickupAddress(data.seller.pickup_address || '')
        setPickupLat(data.seller.pickup_lat || 0)
        setPickupLng(data.seller.pickup_lng || 0)
        setShippingDays(data.seller.shipping_days || [])
        setShippingTime(data.seller.shipping_time || '14:00')
      } catch (err) {
        console.error('Failed to fetch seller:', err)
        setError('ไม่สามารถโหลดข้อมูลได้')
      } finally {
        setLoading(false)
      }
    }

    fetchSeller()
  }, [router])

  const handleAddressChange = useCallback((address: string, lat: number, lng: number) => {
    setPickupAddress(address)
    setPickupLat(lat)
    setPickupLng(lng)
  }, [])

  const toggleDay = (day: number) => {
    setShippingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    // Validate
    if (!shopName.trim()) {
      setError('กรุณากรอกชื่อร้าน')
      return
    }

    if (!promptpayId) {
      setError('กรุณากรอก PromptPay ID')
      return
    }

    const digits = promptpayId.replace(/\D/g, '')
    if (digits.length !== 10 && digits.length !== 13) {
      setError('PromptPay ID ต้องเป็นเบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)')
      return
    }

    if (!pickupAddress || !pickupLat || !pickupLng) {
      setError('กรุณาเลือกที่อยู่จากรายการ')
      return
    }

    if (shippingDays.length === 0) {
      setError('กรุณาเลือกวันที่เปิดให้สั่งอย่างน้อย 1 วัน')
      return
    }

    setSaving(true)

    try {
      // Update shop info
      const infoRes = await fetch('/api/sellers/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName,
          shop_slug: seller?.shop_slug, // Keep existing slug
          promptpay_id: promptpayId,
          pickup_address: pickupAddress,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng
        })
      })

      const infoData = await infoRes.json()
      if (!infoData.success) {
        setError(infoData.message || 'เกิดข้อผิดพลาด')
        return
      }

      // Update schedule
      const scheduleRes = await fetch('/api/sellers/update-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_days: shippingDays,
          shipping_time: shippingTime
        })
      })

      const scheduleData = await scheduleRes.json()
      if (!scheduleData.success) {
        setError(scheduleData.message || 'เกิดข้อผิดพลาด')
        return
      }

      setSuccess('บันทึกเรียบร้อยแล้ว')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('ต้องการออกจากระบบใช่หรือไม่?')) return

    setLoggingOut(true)

    try {
      await fetch('/api/auth/seller/logout', { method: 'POST' })
      router.push('/seller/login')
    } catch (err) {
      console.error('Logout failed:', err)
      // Still redirect even if API fails
      router.push('/seller/login')
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

  return (
    <div className="min-h-screen bg-white px-[5%] py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/seller/dashboard"
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">ตั้งค่าร้าน</h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-success rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-error rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Shop Info Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">ข้อมูลร้าน</h2>
            <div className="space-y-4">
              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อร้าน</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="ร้านของฉัน"
                  maxLength={50}
                  className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                />
              </div>

              {/* Shop URL (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2">ลิงก์ร้าน</label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-neutral-50">
                  <span className="px-4 py-3 text-secondary border-r border-border whitespace-nowrap">
                    tapshop.me/
                  </span>
                  <span className="flex-1 px-4 py-3 text-secondary">
                    {seller?.shop_slug}
                  </span>
                </div>
                <p className="mt-2 text-sm text-secondary">ลิงก์ร้านไม่สามารถแก้ไขได้</p>
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">การชำระเงิน</h2>
            <div>
              <label className="block text-sm font-medium mb-2">PromptPay ID</label>
              <input
                type="text"
                inputMode="numeric"
                value={promptpayId}
                onChange={(e) => setPromptpayId(e.target.value.replace(/\D/g, ''))}
                placeholder="0812345678"
                maxLength={13}
                className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
              />
              <p className="mt-2 text-sm text-secondary">เบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)</p>
            </div>
          </section>

          {/* Address Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">ที่อยู่รับสินค้า</h2>
            {/* Fix #3: Use key to force re-mount with correct defaultValue when seller data loads */}
            <AddressAutocomplete
              key={seller?.id || 'new'}
              value={pickupAddress}
              onChange={handleAddressChange}
            />
            {pickupAddress && pickupLat !== 0 && (
              <p className="mt-2 text-sm text-secondary">
                📍 {pickupAddress}
              </p>
            )}
          </section>

          {/* Schedule Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">ตารางจัดส่ง</h2>
            <div className="space-y-6">
              {/* Shipping Days */}
              <div>
                <label className="block text-sm font-medium mb-3">วันที่เปิดให้สั่ง</label>
                <div className="flex gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        shippingDays.includes(day.value)
                          ? 'bg-black text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                      title={day.fullLabel}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipping Time */}
              <div>
                <label className="block text-sm font-medium mb-3">รอบจัดส่ง</label>
                <div className="space-y-2">
                  {TIME_SLOTS.map((slot) => (
                    <label
                      key={slot.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        shippingTime === slot.value
                          ? 'border-black bg-neutral-50'
                          : 'border-border hover:border-neutral-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_time"
                        value={slot.value}
                        checked={shippingTime === slot.value}
                        onChange={(e) => setShippingTime(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        shippingTime === slot.value
                          ? 'border-black'
                          : 'border-neutral-300'
                      }`}>
                        {shippingTime === slot.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="font-medium">{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-4 border border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
          </button>
        </div>
      </div>
    </div>
  )
}
