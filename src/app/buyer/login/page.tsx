'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Step = 'phone' | 'otp'

function BuyerLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/buyer/account'

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  // Format phone for display
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10 || !digits.startsWith('0')) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/buyer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      setStep('otp')
      setCooldown(60)
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      console.error('Send OTP error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (value && index === 5) {
      const fullOtp = [...newOtp.slice(0, 5), value.slice(-1)].join('')
      if (fullOtp.length === 6) {
        handleVerifyOTP(fullOtp)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      handleVerifyOTP(pastedData)
    }
  }

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('')
    if (code.length !== 6) {
      setError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/buyer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          otp: code
        })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'รหัส OTP ไม่ถูกต้อง')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
        return
      }

      // Success - redirect
      router.push(redirect)
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    if (cooldown > 0) return
    setOtp(['', '', '', '', '', ''])
    handleSendOTP()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-border z-10">
        <div className="flex items-center px-[5%] h-14">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center font-bold">เข้าสู่ระบบ</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-[5%] py-8 max-w-md mx-auto">
        {step === 'phone' ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">เข้าสู่ระบบ</h2>
              <p className="text-secondary">กรอกเบอร์โทรเพื่อดำเนินการต่อ</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-3 border border-border rounded-lg text-lg tracking-wider outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-error text-sm">{error}</p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังส่ง...
                  </span>
                ) : (
                  'ส่งรหัส OTP'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">ยืนยันรหัส OTP</h2>
              <p className="text-secondary">
                ส่งรหัสไปที่ <span className="font-medium text-black">{phone}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                />
              ))}
            </div>

            {error && (
              <p className="text-error text-sm text-center mb-4">{error}</p>
            )}

            <button
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังตรวจสอบ...
                </span>
              ) : (
                'ยืนยัน'
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={cooldown > 0 || loading}
                className="text-secondary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cooldown > 0 ? `ส่งรหัสใหม่ (${cooldown}s)` : 'ส่งรหัสใหม่'}
              </button>
            </div>

            <button
              onClick={() => {
                setStep('phone')
                setOtp(['', '', '', '', '', ''])
                setError('')
              }}
              className="w-full mt-6 py-3 text-secondary hover:text-black transition-colors"
            >
              เปลี่ยนเบอร์โทร
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function BuyerLoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <BuyerLoginContent />
    </Suspense>
  )
}
