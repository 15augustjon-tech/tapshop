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
  { value: '10:00', label: 'รอบเช้า', time: '10:00 น.' },
  { value: '14:00', label: 'รอบบ่าย', time: '14:00 น.' },
  { value: '18:00', label: 'รอบเย็น', time: '18:00 น.' }
]

export default function SellerSettingsPage() {
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

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
      const infoRes = await fetch('/api/sellers/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName,
          shop_slug: seller?.shop_slug,
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
      router.push('/seller/login')
    }
  }

  const handleDeleteAccount = async () => {
    if (!seller) return

    if (confirmText !== seller.shop_name) {
      setError('กรุณาพิมพ์ชื่อร้านให้ถูกต้อง')
      return
    }

    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/sellers/delete-account', {
        method: 'DELETE'
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        setDeleting(false)
        return
      }

      alert('ลบบัญชีสำเร็จ')
      router.push('/')
    } catch (err) {
      console.error('Delete error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setDeleting(false)
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

  return (
    <div className="min-h-screen bg-gradient-main overflow-x-hidden">
      {/* Ambient Lights */}
      <div className="ambient-1" />
      <div className="ambient-2" />

      <div className="px-4 pt-[env(safe-area-inset-top)] pb-24 relative z-10">
        <div className="max-w-md mx-auto pt-2">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/seller/dashboard"
              className="w-10 h-10 flex items-center justify-center glass-card-inner !rounded-full hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">ตั้งค่าร้าน</h1>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 glass-card !rounded-[16px] p-4 border border-[#22c55e]/30 bg-gradient-to-r from-[#22c55e]/10 to-[#22c55e]/5 animate-pop">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-medium text-[#15803d]">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !showDeleteModal && (
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

          <div className="space-y-6">
            {/* Shop Info Section */}
            <section className="glass-card !rounded-[24px] p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box w-10 h-10 !rounded-[12px]">
                  <svg className="w-5 h-5 text-[#7a6f63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">ข้อมูลร้าน</h2>
              </div>

              <div className="space-y-4">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">ชื่อร้าน</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="ร้านของฉัน"
                    maxLength={50}
                    className="input-field"
                  />
                </div>

                {/* Shop URL (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">ลิงก์ร้าน</label>
                  <div className="glass-card-inner !rounded-[14px] flex items-center overflow-hidden">
                    <span className="px-4 py-3.5 text-[#7a6f63] bg-white/30 border-r border-white/50 whitespace-nowrap">
                      tapshop.me/
                    </span>
                    <span className="flex-1 px-4 py-3.5 text-[#1a1a1a] font-medium truncate">
                      {seller?.shop_slug}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#7a6f63]">ลิงก์ร้านไม่สามารถแก้ไขได้</p>
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="glass-card !rounded-[24px] p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#3b82f6]/20 !to-[#2563eb]/10">
                  <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">การชำระเงิน</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">PromptPay ID</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={promptpayId}
                  onChange={(e) => setPromptpayId(e.target.value.replace(/\D/g, ''))}
                  placeholder="0812345678"
                  maxLength={13}
                  className="input-field"
                />
                <p className="mt-2 text-xs text-[#7a6f63]">เบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)</p>
              </div>
            </section>

            {/* Address Section */}
            <section className="glass-card !rounded-[24px] p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#f59e0b]/20 !to-[#d97706]/10">
                  <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">ที่อยู่รับสินค้า</h2>
              </div>

              <AddressAutocomplete
                key={seller?.id || 'new'}
                value={pickupAddress}
                onChange={handleAddressChange}
              />
              {pickupAddress && pickupLat !== 0 && (
                <div className="mt-3 glass-card-inner !rounded-[12px] p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-[#1a1a1a]">{pickupAddress}</p>
                </div>
              )}
            </section>

            {/* Schedule Section */}
            <section className="glass-card !rounded-[24px] p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#8b5cf6]/20 !to-[#7c3aed]/10">
                  <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">ตารางจัดส่ง</h2>
              </div>

              <div className="space-y-6">
                {/* Shipping Days */}
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-3">วันที่เปิดให้สั่ง</label>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`aspect-square flex items-center justify-center rounded-[12px] font-medium text-sm transition-all ${
                          shippingDays.includes(day.value)
                            ? 'bg-[#1a1a1a] text-white shadow-lg'
                            : 'glass-card-inner hover:bg-white/60 text-[#7a6f63]'
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
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-3">รอบจัดส่ง</label>
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setShippingTime(slot.value)}
                        className={`w-full glass-card-inner !rounded-[14px] p-4 flex items-center gap-4 transition-all ${
                          shippingTime === slot.value
                            ? 'ring-2 ring-[#1a1a1a] bg-white/60'
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          shippingTime === slot.value
                            ? 'border-[#1a1a1a] bg-[#1a1a1a]'
                            : 'border-[#a69a8c]'
                        }`}>
                          {shippingTime === slot.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-[#1a1a1a]">{slot.label}</p>
                          <p className="text-sm text-[#7a6f63]">{slot.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full !py-4"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกการตั้งค่า'
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary w-full !py-4"
            >
              {loggingOut ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                  กำลังออก...
                </span>
              ) : (
                'ออกจากระบบ'
              )}
            </button>

            {/* Danger Zone */}
            <div className="pt-6 mt-6 border-t border-white/50">
              <div className="glass-card !rounded-[20px] p-5 border border-[#ef4444]/30 bg-gradient-to-br from-[#ef4444]/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[#ef4444]">โซนอันตราย</h2>
                </div>
                <p className="text-sm text-[#7a6f63] mb-4">
                  การลบบัญชีจะลบข้อมูลทั้งหมดอย่างถาวร รวมถึงสินค้า ออเดอร์ และข้อมูลลูกค้า ไม่สามารถกู้คืนได้
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3.5 px-4 bg-[#ef4444] text-white rounded-[14px] font-semibold hover:bg-[#dc2626] active:scale-[0.98] transition-all"
                >
                  ลบบัญชีถาวร
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#ef4444]">ยืนยันลบบัญชี</h2>
            </div>

            {/* Warning */}
            <div className="glass-card-inner !rounded-[14px] p-4 mb-6 border border-[#ef4444]/20 bg-[#ef4444]/5">
              <p className="text-sm text-[#ef4444] font-medium mb-2">
                คำเตือน: การดำเนินการนี้ไม่สามารถยกเลิกได้
              </p>
              <ul className="text-sm text-[#b91c1c] space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#ef4444] rounded-full" />
                  สินค้าทั้งหมดจะถูกลบ
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#ef4444] rounded-full" />
                  ออเดอร์ทั้งหมดจะถูกลบ
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#ef4444] rounded-full" />
                  ข้อมูลลูกค้าทั้งหมดจะถูกลบ
                </li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <p className="text-sm text-[#1a1a1a] mb-2">
                พิมพ์ <strong className="text-[#ef4444]">{seller?.shop_name}</strong> เพื่อยืนยัน:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={seller?.shop_name}
                disabled={deleting}
                className="input-field"
              />
            </div>

            {error && showDeleteModal && (
              <p className="text-sm text-[#ef4444] mb-4 font-medium">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmText('')
                  setError('')
                }}
                disabled={deleting}
                className="btn-secondary flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || confirmText !== seller?.shop_name}
                className="flex-1 py-3.5 bg-[#ef4444] text-white rounded-[14px] font-semibold hover:bg-[#dc2626] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ลบ...
                  </span>
                ) : (
                  'ลบบัญชี'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
