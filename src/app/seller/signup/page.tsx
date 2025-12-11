'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProgressBar from '@/components/ui/ProgressBar'
import PhoneInput from '@/components/ui/PhoneInput'
import OTPInput from '@/components/ui/OTPInput'
import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebase'

type Step = 'phone' | 'otp'

export default function SellerSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [internationalPhone, setInternationalPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [countdown, setCountdown] = useState(0)

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const confirmationResultRef = useRef<ConfirmationResult | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/sellers/me')
        const data = await res.json()
        if (data.success && data.seller) {
          if (data.seller.onboarding_completed) {
            router.push('/seller/dashboard')
          } else {
            router.push('/seller/signup/info')
          }
          return
        }
      } catch {
        // Not logged in, continue with signup
      }
      setCheckingSession(false)
    }
    checkSession()
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Initialize reCAPTCHA on mount to prevent race conditions
  useEffect(() => {
    if (!checkingSession && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved - will proceed with signInWithPhoneNumber
          },
          'expired-callback': () => {
            // Reset on expiry so next attempt creates fresh verifier
            if (recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current.clear()
              recaptchaVerifierRef.current = null
            }
            setError('reCAPTCHA หมดอายุ กรุณาลองใหม่')
          }
        })
      } catch (err) {
        console.error('Failed to initialize reCAPTCHA:', err)
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null
      }
    }
  }, [checkingSession])

  const initRecaptcha = async () => {
    if (!recaptchaContainerRef.current) return

    // Clear existing verifier completely
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch {
        // Ignore
      }
      recaptchaVerifierRef.current = null
    }

    // Reset container HTML
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = ''
    }

    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100))

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear()
          recaptchaVerifierRef.current = null
        }
        setError('reCAPTCHA หมดอายุ กรุณาลองใหม่')
      }
    })
  }

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

    try {
      // Always ensure reCAPTCHA is ready
      if (!recaptchaVerifierRef.current) {
        await initRecaptcha()
      }

      // Double-check reCAPTCHA is initialized
      if (!recaptchaVerifierRef.current) {
        setError('reCAPTCHA ไม่พร้อม กรุณารีเฟรชหน้า')
        setLoading(false)
        return
      }

      const intlPhone = toInternationalPhone(phone)
      setInternationalPhone(intlPhone)

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        intlPhone,
        recaptchaVerifierRef.current!
      )

      confirmationResultRef.current = confirmationResult
      setStep('otp')
      setCountdown(60)
    } catch (err: unknown) {
      console.error('Firebase send OTP error:', err)
      const firebaseError = err as { code?: string; message?: string }

      if (firebaseError.code === 'auth/invalid-phone-number') {
        setError('เบอร์โทรไม่ถูกต้อง')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('ส่ง OTP มากเกินไป กรุณารอสักครู่')
      } else if (firebaseError.code === 'auth/quota-exceeded') {
        setError('ระบบ SMS เกินโควต้า กรุณาลองใหม่ภายหลัง')
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        setError('Phone Auth ยังไม่ได้เปิดใช้งานใน Firebase')
      } else if (firebaseError.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA ล้มเหลว กรุณาลองใหม่')
      } else if (firebaseError.code === 'auth/missing-phone-number') {
        setError('กรุณากรอกเบอร์โทร')
      } else {
        setError(`เกิดข้อผิดพลาด: ${firebaseError.code || firebaseError.message || 'Unknown'}`)
      }

      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
        recaptchaVerifierRef.current = null
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก')
      return
    }

    if (!confirmationResultRef.current) {
      setError('กรุณาขอรหัส OTP ใหม่')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await confirmationResultRef.current.confirm(otp)
      const idToken = await result.user.getIdToken()

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
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      router.push(data.redirectTo || '/seller/signup/info')
    } catch (err: unknown) {
      console.error('Firebase verify OTP error:', err)
      const firebaseError = err as { code?: string }

      if (firebaseError.code === 'auth/invalid-verification-code') {
        setError('รหัส OTP ไม่ถูกต้อง')
      } else if (firebaseError.code === 'auth/code-expired') {
        setError('รหัส OTP หมดอายุ กรุณาขอใหม่')
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setOtp('')
    setError('')

    // Clear existing reCAPTCHA completely
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch {
        // Ignore clear errors
      }
      recaptchaVerifierRef.current = null
    }

    // handleSendOTP will re-init reCAPTCHA if needed
    await handleSendOTP()
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
    setInternationalPhone('')
    confirmationResultRef.current = null

    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear()
      recaptchaVerifierRef.current = null
    }
  }

  const formatPhoneDisplay = (p: string): string => {
    const digits = p.replace(/\D/g, '')
    if (digits.length >= 9) {
      return `${digits.slice(0, 3)}-XXX-${digits.slice(-4)}`
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
    <div className="min-h-screen bg-gradient-main overflow-hidden">
      {/* Hidden reCAPTCHA container */}
      <div ref={recaptchaContainerRef} id="recaptcha-container" style={{ position: 'fixed', left: '-9999px', top: '-9999px', visibility: 'hidden' }} />

      <div className="px-4 pb-8 safe-area-top">
        <div className="max-w-sm mx-auto pt-4">
          {/* Logo */}
          <Link href="/" className="inline-flex mb-6">
            <span className="text-xl font-bold text-[#1a1a1a]">
              Tap<span className="text-[#22c55e]">Shop</span>
            </span>
          </Link>

          <ProgressBar currentStep={1} totalSteps={3} />

          {step === 'phone' ? (
            <div className="glass-card !rounded-[24px] p-6 mt-4">
              <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">สร้างร้านค้า</h1>
              <p className="text-[#7a6f63] mb-6">กรอกเบอร์โทรศัพท์เพื่อเริ่มต้น</p>

              <div className="space-y-5">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  disabled={loading}
                  error={error}
                />

                <button
                  onClick={handleSendOTP}
                  disabled={loading || phone.length < 9}
                  className="btn-primary w-full !py-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      กำลังส่ง...
                    </span>
                  ) : (
                    'ส่งรหัส OTP'
                  )}
                </button>

                <p className="text-center text-[#7a6f63]">
                  มีบัญชีแล้ว?{' '}
                  <Link href="/seller/login" className="text-[#1a1a1a] font-semibold hover:underline">
                    เข้าสู่ระบบ
                  </Link>
                </p>

                <p className="text-center text-xs text-[#a69a8c]">
                  Protected by reCAPTCHA
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card !rounded-[24px] p-6 mt-4">
              <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">ยืนยันเบอร์โทร</h1>
              <p className="text-[#7a6f63] mb-6">
                รหัส OTP ถูกส่งไปที่ {formatPhoneDisplay(phone)}
              </p>

              <div className="space-y-5">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                  error={error}
                />

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full !py-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      กำลังยืนยัน...
                    </span>
                  ) : (
                    'ยืนยัน'
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className={`flex-1 btn-secondary !py-3 ${
                      countdown > 0 ? 'opacity-50' : ''
                    }`}
                  >
                    {countdown > 0 ? `ส่งใหม่ (${countdown}s)` : 'ส่งรหัสใหม่'}
                  </button>

                  <button
                    onClick={handleChangeNumber}
                    disabled={loading}
                    className="flex-1 btn-secondary !py-3"
                  >
                    เปลี่ยนเบอร์
                  </button>
                </div>

                <p className="text-center text-xs text-[#a69a8c]">
                  Protected by reCAPTCHA
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
