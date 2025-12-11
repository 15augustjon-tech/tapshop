'use client'

import { useState, useMemo } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export default function PhoneInput({ value, onChange, disabled, error }: PhoneInputProps) {
  const [localInput, setLocalInput] = useState<string | null>(null)

  // Normalize phone input - strip country code if present (handles iOS autofill)
  const normalizePhone = (input: string): string => {
    // Get digits only
    let digits = input.replace(/\D/g, '')

    // If starts with 66 and has 11+ digits, remove the country code
    // e.g., 66812345678 -> 812345678 (then we add leading 0)
    if (digits.startsWith('66') && digits.length >= 11) {
      digits = '0' + digits.slice(2)
    }

    // Limit to 10 digits (Thai mobile format: 0XX-XXX-XXXX)
    return digits.slice(0, 10)
  }

  // Format phone number as XXX-XXX-XXXX
  const formatPhone = (input: string): string => {
    const digits = normalizePhone(input)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Compute display value from prop or local input
  const displayValue = useMemo(() => {
    return localInput !== null ? localInput : formatPhone(value)
  }, [value, localInput])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const normalized = normalizePhone(input)
    const formatted = formatPhone(normalized)
    setLocalInput(formatted)
    // Pass normalized digits to parent
    onChange(normalized)
  }

  const handleBlur = () => {
    // Reset local input on blur to sync with prop
    setLocalInput(null)
  }

  return (
    <div className="w-full">
      <div className={`flex items-center border ${error ? 'border-[#ef4444]' : 'border-[#e8e2da]'} rounded-[14px] overflow-hidden focus-within:ring-2 focus-within:ring-[#22c55e] focus-within:ring-offset-0 bg-white shadow-sm`}>
        {/* Thai flag + country code */}
        <div className="flex items-center gap-2 px-4 py-4 bg-white/80 border-r border-[#e8e2da]">
          <span className="text-xl">🇹🇭</span>
          <span className="text-[#1a1a1a] font-semibold">+66</span>
        </div>
        {/* Phone input */}
        <input
          type="tel"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="81 234 5678"
          className="flex-1 px-4 py-4 text-[#1a1a1a] font-medium placeholder:text-[#a3a3a3] placeholder:font-normal bg-transparent outline-none disabled:bg-white/30 disabled:text-[#7a6f63] tracking-wide"
          style={{ fontSize: '18px', WebkitAppearance: 'none' }}
          autoComplete="tel-national"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-[#ef4444]">{error}</p>
      )}
    </div>
  )
}
