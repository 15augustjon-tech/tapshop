'use client'

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled,
  error
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Sync with external value
  useEffect(() => {
    const syncValue = () => {
      if (value) {
        const digits = value.split('').slice(0, length)
        const newOtp = [...Array(length).fill('')]
        digits.forEach((digit, i) => {
          newOtp[i] = digit
        })
        setOtp(newOtp)
      } else {
        setOtp(Array(length).fill(''))
      }
    }
    syncValue()
  }, [value, length])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, digit: string) => {
    // Handle if user types multiple digits (iOS autofill)
    if (digit.length > 1) {
      const digits = digit.replace(/\D/g, '').slice(0, length)
      if (digits) {
        const newOtp = [...Array(length).fill('')]
        digits.split('').forEach((d, i) => {
          newOtp[i] = d
        })
        setOtp(newOtp)
        onChange(newOtp.join(''))
        inputRefs.current[Math.min(digits.length, length) - 1]?.focus()
      }
      return
    }

    if (!/^\d?$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    onChange(newOtp.join(''))

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, length)

    if (digits) {
      const newOtp = [...Array(length).fill('')]
      digits.split('').forEach((digit, i) => {
        newOtp[i] = digit
      })
      setOtp(newOtp)
      onChange(newOtp.join(''))

      // Focus last filled input or last input
      const lastIndex = Math.min(digits.length, length) - 1
      inputRefs.current[lastIndex]?.focus()
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-center gap-3">
        {Array(length)
          .fill(0)
          .map((_, index) => (
            <input
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={disabled}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              className={`w-[52px] h-16 text-center font-extrabold text-[#1a1a1a] border-2 ${
                error
                  ? 'border-[#ef4444] bg-[#fef2f2]'
                  : otp[index]
                    ? 'border-[#22c55e] bg-[#f0fdf4]'
                    : 'border-transparent bg-white'
              } rounded-2xl shadow-sm outline-none focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/10 disabled:bg-white/30 disabled:text-[#7a6f63] transition-all`}
              style={{ fontSize: '24px', WebkitAppearance: 'none' }}
            />
          ))}
      </div>
      {error && (
        <p className="mt-4 text-sm text-[#ef4444] text-center font-medium">{error}</p>
      )}
    </div>
  )
}
