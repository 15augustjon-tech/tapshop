'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebase'
import { toInternationalPhone } from '@/lib/utils'
import ProgressBar from '@/components/ui/ProgressBar'
import PhoneInput from '@/components/ui/PhoneInput'
import OTPInput from '@/components/ui/OTPInput'

type Step = 'phone' | 'otp'

// Global variable to store recaptcha verifier
let recaptchaVerifier: RecaptchaVerifier | null = null

export default function SellerSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/sellers/me')
        const data = await res.json()
        if (data.success && data.seller) {
          // Already logged in - redirect based on onboarding status
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

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear()
        recaptchaVerifier = null
      }
    }
  }, [])

  // Setup reCAPTCHA when on phone step
  useEffect(() => {
    // Only run on client and when on phone step
    if (typeof window === 'undefined') return
    if (step !== 'phone') return
    if (checkingSession) return

    setRecaptchaReady(false)

    // Clear any existing verifier
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear()
      } catch (e) {
        // ignore
      }
      recaptchaVerifier = null
    }

    let attempts = 0
    const maxAttempts = 5

    const initRecaptcha = () => {
      attempts++
      const container = document.getElementById('recaptcha-container')

      if (!container || !auth) {
        // Retry if not ready yet (up to maxAttempts)
        if (attempts < maxAttempts) {
          setTimeout(initRecaptcha, 500)
        }
        return
      }

      try {
        recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA verified
          },
          'expired-callback': () => {
            setRecaptchaReady(false)
            setError('reCAPTCHA หมดอายุ กรุณารีเฟรชหน้า')
          }
        })

        // Pre-render the reCAPTCHA
        recaptchaVerifier.render()
          .then(() => {
            setRecaptchaReady(true)
          })
          .catch(() => {
            // Retry on render error
            if (attempts < maxAttempts) {
              setTimeout(initRecaptcha, 500)
            }
          })
      } catch {
        // Retry on creation error
        if (attempts < maxAttempts) {
          setTimeout(initRecaptcha, 500)
        }
      }
    }

    // Start initialization after a short delay
    const timer = setTimeout(initRecaptcha, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [step, checkingSession]) // Re-run when step or checkingSession changes

  const handleSendOTP = async () => {
    if (phone.length < 9) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง')
      return
    }

    if (!recaptchaVerifier || !auth) {
      setError('กรุณารอสักครู่แล้วลองใหม่')
      return
    }

    setError('')
    setLoading(true)

    try {
      const internationalPhone = toInternationalPhone(phone)

      const result = await signInWithPhoneNumber(auth, internationalPhone, recaptchaVerifier)

      setConfirmationResult(result)
      setStep('otp')
      setCountdown(60)
      localStorage.setItem('signup_phone', internationalPhone)
    } catch (err: any) {
      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-phone-number') {
        setError('เบอร์โทรไม่ถูกต้อง')
      } else if (err.code === 'auth/too-many-requests') {
        setError('ส่ง OTP มากเกินไป กรุณารอสักครู่')
      } else if (err.code === 'auth/quota-exceeded') {
        setError('เกินโควต้าการส่ง SMS กรุณาลองใหม่พรุ่งนี้')
      } else if (err.code === 'auth/invalid-app-credential') {
        setError('การตั้งค่า Firebase ไม่ถูกต้อง - ตรวจสอบ Console')
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA ล้มเหลว กรุณาลองใหม่')
      } else {
        setError(`Error: ${err.code || err.message || 'Unknown error'}`)
      }

      // Don't clear recaptcha on error - let user retry
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก')
      return
    }

    if (!confirmationResult) {
      setError('กรุณาส่งรหัส OTP ใหม่')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await confirmationResult.confirm(otp)
      const user = result.user

      // Get the ID token for server-side verification
      const idToken = await user.getIdToken()

      // Create/get seller in our database (send ID token, not raw data)
      const res = await fetch('/api/auth/seller/firebase-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, isSignup: true })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'เกิดข้อผิดพลาด')
        return
      }

      localStorage.removeItem('signup_phone')
      router.push(data.redirectTo)
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('รหัส OTP ไม่ถูกต้อง')
      } else if (err.code === 'auth/code-expired') {
        setError('รหัส OTP หมดอายุ กรุณาส่งใหม่')
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
    setStep('phone') // Go back to phone step to show reCAPTCHA again
  }

  const handleChangeNumber = () => {
    localStorage.removeItem('signup_phone')
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
    setConfirmationResult(null)
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
        <ProgressBar currentStep={1} totalSteps={3} />

        {step === 'phone' ? (
          <>
            <h1 className="text-3xl font-bold mb-2">สร้างร้านค้า</h1>
            <p className="text-secondary mb-8">กรอกเบอร์โทรศัพท์เพื่อเริ่มต้น</p>

            <div className="space-y-6">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={loading}
                error={error}
              />

              {/* Invisible reCAPTCHA container */}
              <div id="recaptcha-container"></div>

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 9 || !recaptchaReady}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
              >
                {loading ? 'กำลังส่ง...' : !recaptchaReady ? 'กำลังโหลด...' : 'ส่งรหัส OTP'}
              </button>

              <p className="text-center text-secondary">
                มีบัญชีแล้ว?{' '}
                <a href="/seller/login" className="text-black font-semibold hover:underline">
                  เข้าสู่ระบบ
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">ยืนยันเบอร์โทร</h1>
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

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
              >
                {loading ? 'กำลังยืนยัน...' : 'ยืนยัน'}
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
