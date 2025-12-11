'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from '@/components/ui/PhoneInput'
import OTPInput from '@/components/ui/OTPInput'
import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebase'

type Step = 'phone' | 'otp'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    confirmationResult?: ConfirmationResult
  }
}

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

  const initRecaptcha = useCallback(() => {
    if (typeof window === 'undefined') return

    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch {
        // Ignore errors when clearing
      }
      window.recaptchaVerifier = undefined
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          initRecaptcha()
        }
      })
      window.recaptchaVerifier.render()
    } catch (err) {
      console.error('reCAPTCHA init error:', err)
    }
  }, [])

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
        // Not logged in
      }
      setCheckingSession(false)
    }
    checkSession()
  }, [router])

  useEffect(() => {
    if (!checkingSession && step === 'phone') {
      initRecaptcha()
    }
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch {
          // Ignore
        }
        window.recaptchaVerifier = undefined
      }
    }
  }, [checkingSession, step, initRecaptcha])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const toInternationalPhone = (p: string): string => {
    const digits = p.replace(/\D/g, '')
    if (digits.startsWith('0')) {
      return '+66' + digits.slice(1)
    }
    if (digits.startsWith('66')) {
      return '+' + digits
    }
    return '+66' + digits
  }

  const handleSendOTP = async () => {
    if (phone.length < 9) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
      return
    }

    setError('')
    setLoading(true)

    const formattedPhone = toInternationalPhone(phone)
    setInternationalPhone(formattedPhone)

    try {
      if (!window.recaptchaVerifier) {
        initRecaptcha()
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (!window.recaptchaVerifier) {
        setError('กรุณารอสักครู่แล้วลองใหม่')
        setLoading(false)
        return
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      )

      window.confirmationResult = confirmationResult
      setStep('otp')
      setCountdown(60)
    } catch (err: unknown) {
      console.error('Send OTP error:', err)
      const firebaseError = err as { code?: string; message?: string }

      if (firebaseError.code === 'auth/invalid-phone-number') {
        setError('เบอร์โทรไม่ถูกต้อง')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('ส่ง OTP มากเกินไป กรุณารอสักครู่')
      } else if (firebaseError.code === 'auth/captcha-check-failed') {
        setError('การยืนยันล้มเหลว กรุณาลองใหม่')
        initRecaptcha()
      } else {
        setError('ส่ง OTP ไม่สำเร็จ กรุณาลองใหม่')
      }

      initRecaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก')
      return
    }

    if (!window.confirmationResult) {
      setError('กรุณาส่ง OTP ใหม่')
      setStep('phone')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await window.confirmationResult.confirm(otp)
      const user = result.user
      const idToken = await user.getIdToken()

      const res = await fetch('/api/auth/seller/verify-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          phone: internationalPhone
        })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'การยืนยันล้มเหลว')
        return
      }

      router.push(data.redirectTo || '/seller/dashboard')
    } catch (err: unknown) {
      console.error('Verify OTP error:', err)
      const firebaseError = err as { code?: string }

      if (firebaseError.code === 'auth/invalid-verification-code') {
        setError('รหัส OTP ไม่ถูกต้อง')
      } else if (firebaseError.code === 'auth/code-expired') {
        setError('รหัส OTP หมดอายุ กรุณาส่งใหม่')
      } else {
        setError('การยืนยันล้มเหลว กรุณาลองใหม่')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp('')
    setError('')
    setStep('phone')
    initRecaptcha()
    await new Promise(resolve => setTimeout(resolve, 500))
    await handleSendOTP()
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
    setInternationalPhone('')
    window.confirmationResult = undefined
    initRecaptcha()
  }

  const formatPhoneDisplay = (p: string): string => {
    const digits = p.replace(/\D/g, '')
    if (digits.length >= 9) {
      return `+66 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    }
    return p
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="icon-box w-16 h-16 !rounded-[20px] animate-pulse">
          <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-main">
      <div id="recaptcha-container" />

      <div className="ambient-1" />
      <div className="ambient-2" />
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />

      <div className="min-h-[100dvh] flex flex-col px-4 pt-[max(12px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] relative z-10">
        {/* Back button */}
        <div className="py-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#7a6f63] hover:text-[#1a1a1a] transition-colors">
            <span>←</span> กลับ
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-4">
          {step === 'phone' ? (
            <>
              {/* Logo */}
              <div className="text-center mb-6 animate-fade-in-down">
                <h1 className="text-4xl font-black tracking-tight mb-1">
                  <span className="text-[#1a1a1a]">Tap</span>
                  <span className="text-[#22c55e]">Shop</span>
                </h1>
                <p className="text-[#7a6f63] text-sm">ขายออนไลน์ เราจัดส่งให้</p>
              </div>

              {/* Login card */}
              <div className="glass-card !rounded-[24px] p-5 animate-fade-in-up">
                <h2 className="text-xl font-extrabold text-[#1a1a1a] text-center mb-1">ยินดีต้อนรับ</h2>
                <p className="text-[#7a6f63] text-center text-sm mb-5">กรอกเบอร์โทรศัพท์เพื่อดำเนินการต่อ</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#7a6f63] mb-2">เบอร์โทรศัพท์</label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      disabled={loading}
                      error={error}
                    />
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length < 9}
                    className="btn-primary w-full !py-3.5 !text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        กำลังส่ง...
                      </span>
                    ) : (
                      'ดำเนินการต่อ →'
                    )}
                  </button>

                  <p className="text-[11px] text-[#a3a3a3] text-center leading-relaxed">
                    การดำเนินการต่อถือว่าคุณยอมรับ{' '}
                    <Link href="/terms" className="text-[#7a6f63] underline">ข้อกำหนดการใช้งาน</Link>
                    {' '}และ{' '}
                    <Link href="/privacy" className="text-[#7a6f63] underline">นโยบายความเป็นส่วนตัว</Link>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-5">
                <p className="text-[13px] text-[#7a6f63]">
                  ยังไม่มีบัญชี?{' '}
                  <Link href="/seller/signup" className="text-[#22c55e] font-semibold">
                    สร้างร้านค้า
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* OTP Card */}
              <div className="glass-card !rounded-[24px] p-5 text-center animate-fade-in-up">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-1">ยืนยันเบอร์โทร</h2>
                <p className="text-[#7a6f63] text-sm mb-1">รหัส 6 หลักถูกส่งไปที่</p>
                <p className="text-base font-bold text-[#1a1a1a] mb-5">{formatPhoneDisplay(phone)}</p>

                <div className="space-y-4">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                    error={error}
                  />

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="btn-primary w-full !py-3.5 !text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        กำลังยืนยัน...
                      </span>
                    ) : (
                      'ยืนยัน →'
                    )}
                  </button>

                  <p className="text-[13px] text-[#7a6f63]">
                    ไม่ได้รับรหัส?{' '}
                    {countdown > 0 ? (
                      <span className="font-bold text-[#22c55e]">ส่งใหม่ใน {countdown}s</span>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={loading}
                        className="font-bold text-[#22c55e] hover:underline"
                      >
                        ส่งรหัสใหม่
                      </button>
                    )}
                  </p>

                  <button
                    onClick={handleChangeNumber}
                    disabled={loading}
                    className="text-[13px] text-[#7a6f63] font-semibold hover:text-[#1a1a1a] transition-colors"
                  >
                    ← เปลี่ยนเบอร์โทร
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
