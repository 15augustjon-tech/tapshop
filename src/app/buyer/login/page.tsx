'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebase'

type Step = 'phone' | 'otp'

// Extend window for recaptcha
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    confirmationResult?: ConfirmationResult
  }
}

function BuyerLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Validate redirect to prevent open redirect vulnerability
  const rawRedirect = searchParams.get('redirect') || '/buyer/account'
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/buyer/account'

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [internationalPhone, setInternationalPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize reCAPTCHA
  const initRecaptcha = useCallback(() => {
    if (typeof window === 'undefined') return

    // Clean up existing verifier
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch {
        // Ignore errors when clearing
      }
      window.recaptchaVerifier = undefined
    }

    // Create invisible reCAPTCHA
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA verified
        },
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
    if (step === 'phone') {
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
  }, [step, initRecaptcha])

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

  // Convert Thai phone to international format
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

    const formattedPhone = toInternationalPhone(digits)
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
      setCooldown(60)
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      console.error('Send OTP error:', err)
      const firebaseError = err as { code?: string; message?: string }

      // Handle specific Firebase errors
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

      // Reset reCAPTCHA on error
      initRecaptcha()
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

    if (!window.confirmationResult) {
      setError('กรุณาส่ง OTP ใหม่')
      setStep('phone')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify OTP with Firebase
      const result = await window.confirmationResult.confirm(code)
      const user = result.user

      // Get ID token
      const idToken = await user.getIdToken()

      // Send to backend to create/login buyer
      const res = await fetch('/api/auth/buyer/verify-firebase', {
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
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
        return
      }

      // Success - redirect
      router.push(redirect)
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
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    if (cooldown > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    setStep('phone')
    initRecaptcha()
    setTimeout(() => handleSendOTP(), 500)
  }

  return (
    <div className="h-[100dvh] bg-white overflow-hidden fixed inset-0 flex flex-col">
      {/* Firebase reCAPTCHA container */}
      <div id="recaptcha-container" />

      {/* Header */}
      <header className="bg-white border-b border-border flex-shrink-0 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-4 h-12">
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

      {/* Main content - takes remaining space and centers content */}
      <div className="flex-1 flex flex-col justify-center px-5 pb-[env(safe-area-inset-bottom)] max-w-md mx-auto w-full">
        {step === 'phone' ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-1">เข้าสู่ระบบ</h2>
              <p className="text-secondary text-sm">กรอกเบอร์โทรเพื่อดำเนินการต่อ</p>
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
                className="w-full py-3.5 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
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
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-1">ยืนยันรหัส OTP</h2>
              <p className="text-secondary text-sm">
                ส่งรหัสไปที่ <span className="font-medium text-black">{phone}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-5" onPaste={handleOtpPaste}>
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
                  className="w-11 h-13 text-center text-2xl font-bold border border-border rounded-lg outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                />
              ))}
            </div>

            {error && (
              <p className="text-error text-sm text-center mb-4">{error}</p>
            )}

            <button
              onClick={() => handleVerifyOTP()}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3.5 bg-black text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors mb-4"
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

            <div className="text-center space-y-3">
              <button
                onClick={handleResendOTP}
                disabled={cooldown > 0 || loading}
                className="text-secondary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {cooldown > 0 ? `ส่งรหัสใหม่ (${cooldown}s)` : 'ส่งรหัสใหม่'}
              </button>

              <button
                onClick={() => {
                  setStep('phone')
                  setOtp(['', '', '', '', '', ''])
                  setError('')
                  window.confirmationResult = undefined
                  initRecaptcha()
                }}
                className="block w-full py-2 text-secondary hover:text-black transition-colors text-sm"
              >
                เปลี่ยนเบอร์โทร
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="h-[100dvh] bg-white flex items-center justify-center fixed inset-0">
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
