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
  { value: '10:00', label: 'รอบเช้า (10:00)' },
  { value: '14:00', label: 'รอบบ่าย (14:00)' },
  { value: '18:00', label: 'รอบเย็น (18:00)' }
]

export default function SchedulePage() {
  const router = useRouter()
  const [shippingDays, setShippingDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri default
  const [shippingTime, setShippingTime] = useState('14:00') // Afternoon default
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
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-[5%] py-8">
      <div className="max-w-md mx-auto">
        <ProgressBar currentStep={3} totalSteps={3} />

        <h1 className="text-3xl font-bold mb-2">ตั้งเวลาจัดส่ง</h1>
        <p className="text-secondary mb-8">เลือกวันและเวลาที่คุณพร้อมส่งของ</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-error rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Shipping Days */}
          <div>
            <label className="block text-sm font-medium mb-4">วันที่เปิดให้สั่ง</label>
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
            <p className="mt-2 text-sm text-secondary">
              เลือกแล้ว: {shippingDays.length} วัน
            </p>
          </div>

          {/* Shipping Time */}
          <div>
            <label className="block text-sm font-medium mb-4">รอบจัดส่ง</label>
            <div className="space-y-3">
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

          {/* Info Box */}
          <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="text-xl">⏰</div>
            <p className="text-sm text-neutral-700">
              เราจะส่งข้อความเตือนคุณ 1 ชั่วโมงก่อนเวลาจัดส่ง เพื่อให้คุณยืนยันออเดอร์
            </p>
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
              disabled={loading || shippingDays.length === 0}
              className="flex-1 py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            >
              {loading ? 'กำลังบันทึก...' : 'เสร็จสิ้น'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
