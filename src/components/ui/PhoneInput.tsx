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

  // Format phone number as XXX-XXX-XXXX
  const formatPhone = (input: string): string => {
    const digits = input.replace(/\D/g, '').slice(0, 10)
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
    const formatted = formatPhone(input)
    setLocalInput(formatted)
    // Pass raw digits to parent
    onChange(input.replace(/\D/g, ''))
  }

  const handleBlur = () => {
    // Reset local input on blur to sync with prop
    setLocalInput(null)
  }

  return (
    <div className="w-full">
      <div className={`flex items-center border ${error ? 'border-[#ef4444]' : 'border-[#e8e2da]'} rounded-[12px] overflow-hidden focus-within:ring-2 focus-within:ring-[#1a1a1a] focus-within:ring-offset-1 bg-white/50`}>
        {/* Thai flag + country code */}
        <div className="flex items-center gap-2 px-4 py-3.5 bg-white/30 border-r border-[#e8e2da]">
          <span className="text-xl">🇹🇭</span>
          <span className="text-[#7a6f63]">+66</span>
        </div>
        {/* Phone input */}
        <input
          type="tel"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="081-234-5678"
          className="flex-1 px-4 py-3.5 text-[#1a1a1a] placeholder:text-[#a69a8c] bg-transparent outline-none disabled:bg-white/30 disabled:text-[#7a6f63]"
          style={{ fontSize: '16px', WebkitAppearance: 'none' }}
          autoComplete="tel"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-[#ef4444]">{error}</p>
      )}
    </div>
  )
}
