'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ui/ProgressBar'

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

export default function SchedulePage() {
  const router = useRouter()
  const [shippingDays, setShippingDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [shippingTime, setShippingTime] = useState('14:00')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleDay = (day: number) => {
    setShippingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }

  const handleSubmit = async () => {
    if (shippingDays.length === 0) {
      setError('กรุณาเลือกวันที่เปิดให้สั่งอย่างน้อย 1 วัน')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/sellers/update-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_days: shippingDays,
          shipping_time: shippingTime
        })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      router.push('/seller/signup/success')
    } catch {
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

      <div className="px-4 pt-4 pb-8 relative z-10">
        <div className="max-w-md mx-auto">
          <ProgressBar currentStep={3} totalSteps={3} />

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">ตั้งเวลาจัดส่ง</h1>
          <p className="text-[#7a6f63] mb-8">เลือกวันและเวลาที่คุณพร้อมส่งของ</p>

          {error && (
            <div className="mb-6 glass-card !rounded-[16px] p-4 border border-[#ef4444]/30 bg-gradient-to-r from-[#ef4444]/10 to-[#ef4444]/5">
              <p className="text-[#ef4444] font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Shipping Days */}
            <div className="glass-card !rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#8b5cf6]/20 !to-[#7c3aed]/10">
                  <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-[#1a1a1a]">วันที่เปิดให้สั่ง</h2>
                  <p className="text-sm text-[#7a6f63]">เลือกแล้ว {shippingDays.length} วัน</p>
                </div>
              </div>
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
            <div className="glass-card !rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-box w-10 h-10 !rounded-[12px] !bg-gradient-to-br !from-[#f59e0b]/20 !to-[#d97706]/10">
                  <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-bold text-[#1a1a1a]">รอบจัดส่ง</h2>
              </div>
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

            {/* Info Box */}
            <div className="glass-card !rounded-[16px] p-4 border border-[#3b82f6]/30 bg-gradient-to-r from-[#3b82f6]/10 to-[#3b82f6]/5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#1a1a1a]">
                  เราจะส่งข้อความเตือนคุณ 1 ชั่วโมงก่อนเวลาจัดส่ง เพื่อให้คุณยืนยันออเดอร์
                </p>
              </div>
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
                disabled={loading || shippingDays.length === 0}
                className="btn-primary flex-1 !py-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    บันทึก...
                  </span>
                ) : (
                  'เสร็จสิ้น'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
