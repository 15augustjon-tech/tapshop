'use client'

import { useState, useEffect } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export default function PhoneInput({ value, onChange, disabled, error }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Format phone number as XXX-XXX-XXXX
  const formatPhone = (input: string): string => {
    const digits = input.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Update display when value changes
  useEffect(() => {
    setDisplayValue(formatPhone(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatPhone(input)
    setDisplayValue(formatted)
    // Pass raw digits to parent
    onChange(input.replace(/\D/g, ''))
  }

  return (
    <div className="w-full">
      <div className={`flex items-center border ${error ? 'border-error' : 'border-border'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-1`}>
        {/* Thai flag + country code */}
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-r border-border">
          <span className="text-xl">🇹🇭</span>
          <span className="text-secondary">+66</span>
        </div>
        {/* Phone input */}
        <input
          type="tel"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="081-234-5678"
          className="flex-1 px-4 py-3 text-lg outline-none disabled:bg-neutral-100 disabled:text-secondary"
          autoComplete="tel"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  )
}
