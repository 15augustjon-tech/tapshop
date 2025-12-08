'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from '@/components/ui/PhoneInput'
import OTPInput from '@/components/ui/OTPInput'

type Step = 'phone' | 'otp'

export default function SellerLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [internationalPhone, setInternationalPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [countdown, setCountdown] = useState(0)

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/sellers/me')
        const data = await res.json()
        if (data.success && data.seller) {
          router.push('/seller/dashboard')
          return
        }
      } catch {
        // Not logged in, continue
      }
      setCheckingSession(false)
    }
    checkSession()
  }, [router])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (phone.length < 9) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/seller/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      // Store international phone for verify step
      setInternationalPhone(data.phone)
      setStep('otp')
      setCountdown(60)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/seller/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: internationalPhone, code: otp })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      // Check if this is a new account (phone not found)
      if (data.isNew) {
        setError('ไม่พบร้านค้าที่ใช้เบอร์นี้')
        return
      }

      router.push(data.redirectTo || '/seller/dashboard')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/seller/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      setCountdown(60)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
    setInternationalPhone('')
  }

  const formatPhoneDisplay = (p: string): string => {
    const digits = p.replace(/\D/g, '')
    if (digits.length >= 9) {
      return `${digits.slice(0, 3)}-XXX-${digits.slice(-4)}`
    }
    return p
  }

  // Show loading while checking session
  if (checkingSession) {
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
        {/* Logo */}
        <Link href="/" className="inline-block text-2xl font-bold mb-8">
          TapShop
        </Link>

        {step === 'phone' ? (
          <>
            <h1 className="text-3xl font-bold mb-2">เข้าสู่ระบบร้านค้า</h1>
            <p className="text-secondary mb-8">กรอกเบอร์โทรที่ใช้สมัคร</p>

            <div className="space-y-6">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={loading}
                error={error}
              />

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 9}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
              >
                {loading ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
              </button>

              <p className="text-center text-secondary">
                ยังไม่มีร้าน?{' '}
                <Link href="/seller/signup" className="text-black font-semibold hover:underline">
                  สร้างร้านเลย
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">เข้าสู่ระบบร้านค้า</h1>
            <p className="text-secondary mb-8">
              รหัส OTP ถูกส่งไปที่ {formatPhoneDisplay(phone)}
            </p>

            <div className="space-y-6">
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
                error={error}
              />

              {/* Show signup link if phone not found */}
              {error === 'ไม่พบร้านค้าที่ใช้เบอร์นี้' && (
                <div className="text-center">
                  <Link
                    href="/seller/signup"
                    className="text-black font-semibold hover:underline"
                  >
                    สร้างร้านใหม่
                  </Link>
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
              >
                {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
              </button>

              <div className="flex justify-between">
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className={`px-4 py-3 min-h-[44px] text-sm rounded-lg transition-colors ${
                    countdown > 0
                      ? 'text-secondary bg-neutral-100'
                      : 'text-black border border-border hover:bg-neutral-100'
                  } disabled:cursor-not-allowed`}
                >
                  {countdown > 0 ? `ส่งรหัสใหม่ (${countdown}s)` : 'ส่งรหัสใหม่'}
                </button>

                <button
                  onClick={handleChangeNumber}
                  disabled={loading}
                  className="px-4 py-3 min-h-[44px] text-sm text-black border border-border rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  เปลี่ยนเบอร์
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
